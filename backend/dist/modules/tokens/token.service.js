"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = void 0;
const db_1 = require("@/lib/db");
const socket_1 = require("@/lib/socket");
class TokenService {
    async bookToken(patientId, data) {
        const patientIdBigInt = BigInt(patientId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await db_1.prisma.$transaction(async (tx) => {
            let session = await tx.session.findUnique({
                where: {
                    doctorId_sessionDate: {
                        doctorId: data.doctorId,
                        sessionDate: today
                    }
                }
            });
            if (!session) {
                session = await tx.session.create({
                    data: {
                        doctorId: data.doctorId,
                        sessionDate: today,
                        status: 'NOT_STARTED'
                    }
                });
            }
            if (session.status === 'ENDED') {
                throw new Error('Doctor session has ended for today');
            }
            const existingToken = await tx.token.findFirst({
                where: {
                    patientId: patientIdBigInt,
                    sessionId: session.id,
                    status: {
                        in: ['WAITING', 'CALLED']
                    }
                }
            });
            if (existingToken) {
                throw new Error('You already have an active token for this doctor today');
            }
            const lockedSession = await tx.session.findUnique({
                where: { id: session.id },
            });
            if (!lockedSession) {
                throw new Error('Session not found');
            }
            const tokenCount = await tx.token.count({
                where: { sessionId: session.id }
            });
            const nextTokenNo = tokenCount + 1;
            if (nextTokenNo > lockedSession.maxTokenNo) {
                throw new Error(`Session is full. Maximum ${lockedSession.maxTokenNo} tokens allowed.`);
            }
            const token = await tx.token.create({
                data: {
                    sessionId: session.id,
                    patientId: patientIdBigInt,
                    tokenNo: nextTokenNo,
                    status: 'WAITING'
                },
                include: {
                    session: {
                        include: {
                            doctor: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    specialization: true
                                }
                            }
                        }
                    },
                    patient: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    }
                }
            });
            await tx.tokenLog.create({
                data: {
                    tokenId: token.id,
                    sessionId: session.id,
                    doctorId: data.doctorId,
                    patientId: patientIdBigInt,
                    action: 'BOOKED',
                    meta: {
                        tokenNo: nextTokenNo,
                        patientName: token.patient.fullName
                    }
                }
            });
            const tokensAhead = Math.max(0, nextTokenNo - session.currentTokenNo - 1);
            const queueLength = await tx.token.count({
                where: {
                    sessionId: session.id,
                    status: {
                        in: ['WAITING', 'CALLED']
                    }
                }
            });
            socket_1.socketManager.emitToDoctorRoom(data.doctorId.toString(), 'token:booked', {
                doctorId: data.doctorId.toString(),
                sessionId: session.id.toString(),
                tokenNo: nextTokenNo,
                patientId: patientId,
                maxToken: nextTokenNo,
                queueLength
            });
            socket_1.socketManager.emitToUser(patientId, 'mytoken:created', {
                tokenId: token.id.toString(),
                doctorId: data.doctorId.toString(),
                sessionId: session.id.toString(),
                tokenNo: nextTokenNo,
                tokensAhead
            });
            return {
                token: {
                    id: token.id.toString(),
                    tokenNo: token.tokenNo,
                    status: token.status,
                    bookedAt: token.bookedAt,
                    tokensAhead
                },
                session: {
                    id: session.id.toString(),
                    currentToken: session.currentTokenNo,
                    maxToken: nextTokenNo,
                    status: session.status
                },
                doctor: token.session.doctor
            };
        });
    }
    async getMyTokens(patientId, doctorId, status) {
        const patientIdBigInt = BigInt(patientId);
        const tokens = await db_1.prisma.token.findMany({
            where: {
                patientId: patientIdBigInt,
                ...(doctorId && {
                    session: {
                        doctorId: doctorId
                    }
                }),
                ...(status && { status: status })
            },
            include: {
                session: {
                    include: {
                        doctor: {
                            select: {
                                id: true,
                                fullName: true,
                                specialization: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                bookedAt: 'desc'
            }
        });
        const tokensWithAhead = await Promise.all(tokens.map(async (token) => {
            let tokensAhead = 0;
            if (token.status === 'WAITING' || token.status === 'CALLED') {
                tokensAhead = Math.max(0, token.tokenNo - token.session.currentTokenNo - 1);
            }
            return {
                id: token.id.toString(),
                tokenNo: token.tokenNo,
                status: token.status,
                bookedAt: token.bookedAt,
                calledAt: token.calledAt,
                servedAt: token.servedAt,
                tokensAhead,
                session: {
                    id: token.session.id.toString(),
                    sessionDate: token.session.sessionDate,
                    currentToken: token.session.currentTokenNo,
                    maxToken: token.session.maxTokenNo,
                    status: token.session.status,
                    doctor: token.session.doctor
                }
            };
        }));
        return tokensWithAhead;
    }
    async getDoctorSession(doctorId, patientId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const session = await db_1.prisma.session.findUnique({
            where: {
                doctorId_sessionDate: {
                    doctorId,
                    sessionDate: today
                }
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        fullName: true,
                        specialization: true,
                        yearsExperience: true
                    }
                }
            }
        });
        if (!session) {
            const doctor = await db_1.prisma.doctor.findUnique({
                where: { id: doctorId },
                select: {
                    id: true,
                    fullName: true,
                    specialization: true,
                    yearsExperience: true
                }
            });
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            return {
                session: {
                    id: null,
                    status: 'NOT_STARTED',
                    currentToken: 0,
                    maxToken: 0,
                    queueLength: 0
                },
                doctor,
                myToken: null
            };
        }
        const queueLength = await db_1.prisma.token.count({
            where: {
                sessionId: session.id,
                status: {
                    in: ['WAITING', 'CALLED']
                }
            }
        });
        let myToken = null;
        if (patientId) {
            const patientToken = await db_1.prisma.token.findFirst({
                where: {
                    patientId: BigInt(patientId),
                    sessionId: session.id,
                    status: {
                        in: ['WAITING', 'CALLED']
                    }
                }
            });
            if (patientToken) {
                const tokensAhead = Math.max(0, patientToken.tokenNo - session.currentTokenNo - 1);
                myToken = {
                    id: patientToken.id.toString(),
                    tokenNo: patientToken.tokenNo,
                    status: patientToken.status,
                    tokensAhead
                };
            }
        }
        return {
            session: {
                id: session.id.toString(),
                doctorId: session.doctorId.toString(),
                sessionDate: session.sessionDate.toISOString(),
                status: session.status,
                currentTokenNo: session.currentTokenNo,
                maxTokenNo: session.maxTokenNo,
                startedAt: session.startedAt?.toISOString(),
                endedAt: session.endedAt?.toISOString()
            },
            doctor: session.doctor,
            myToken
        };
    }
    async getSessionTokens(sessionId) {
        const sessionIdBigInt = BigInt(sessionId);
        const tokens = await db_1.prisma.token.findMany({
            where: {
                sessionId: sessionIdBigInt
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        fullName: true,
                        phone: true,
                        email: true,
                        dob: true,
                        sex: true,
                        address: true
                    }
                }
            },
            orderBy: {
                tokenNo: 'asc'
            }
        });
        return tokens.map(token => ({
            id: token.id.toString(),
            tokenNo: token.tokenNo,
            status: token.status,
            bookedAt: token.bookedAt,
            calledAt: token.calledAt,
            servedAt: token.servedAt,
            canceledAt: token.canceledAt,
            noShowAt: token.noShowAt,
            patient: {
                id: token.patient.id.toString(),
                fullName: token.patient.fullName,
                phone: token.patient.phone,
                email: token.patient.email,
                dob: token.patient.dob ? token.patient.dob.toISOString().split('T')[0] : undefined,
                sex: token.patient.sex,
                address: token.patient.address
            }
        }));
    }
}
exports.tokenService = new TokenService();
//# sourceMappingURL=token.service.js.map