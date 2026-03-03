"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = void 0;
const db_1 = require("@/lib/db");
const socket_1 = require("@/lib/socket");
class SessionService {
    async startSession(doctorId) {
        const doctorIdBigInt = BigInt(doctorId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await db_1.prisma.$transaction(async (tx) => {
            const doctor = await tx.doctor.findUnique({
                where: { id: doctorIdBigInt }
            });
            if (!doctor || !doctor.isActive) {
                throw new Error('Doctor is not approved or active');
            }
            let session = await tx.session.findUnique({
                where: {
                    doctorId_sessionDate: {
                        doctorId: doctorIdBigInt,
                        sessionDate: today
                    }
                }
            });
            if (!session) {
                session = await tx.session.create({
                    data: {
                        doctorId: doctorIdBigInt,
                        sessionDate: today,
                        status: 'NOT_STARTED',
                        maxTokenNo: 50
                    }
                });
            }
            if (session.status === 'ACTIVE') {
                throw new Error('Session is already active');
            }
            if (session.status === 'ENDED') {
                throw new Error('Session has already ended for today');
            }
            const updatedSession = await tx.session.update({
                where: { id: session.id },
                data: {
                    status: 'ACTIVE',
                    startedAt: new Date()
                }
            });
            await tx.tokenLog.create({
                data: {
                    sessionId: session.id,
                    doctorId: doctorIdBigInt,
                    action: 'SESSION_START',
                    meta: {
                        startedAt: new Date().toISOString()
                    }
                }
            });
            socket_1.socketManager.emitToDoctorRoom(doctorId, 'session:started', {
                doctorId,
                sessionId: session.id.toString(),
                status: 'ACTIVE',
                currentToken: updatedSession.currentTokenNo,
                maxToken: updatedSession.maxTokenNo,
                startedAt: updatedSession.startedAt.toISOString()
            });
            return {
                session: {
                    id: updatedSession.id.toString(),
                    status: updatedSession.status,
                    currentToken: updatedSession.currentTokenNo,
                    maxToken: updatedSession.maxTokenNo,
                    startedAt: updatedSession.startedAt
                }
            };
        });
    }
    async pauseSession(doctorId) {
        const doctorIdBigInt = BigInt(doctorId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const session = await db_1.prisma.session.findUnique({
            where: {
                doctorId_sessionDate: {
                    doctorId: doctorIdBigInt,
                    sessionDate: today
                }
            }
        });
        if (!session) {
            throw new Error('No active session found for today');
        }
        if (session.status !== 'ACTIVE') {
            throw new Error('Session is not active');
        }
        const updatedSession = await db_1.prisma.session.update({
            where: { id: session.id },
            data: { status: 'PAUSED' }
        });
        await db_1.prisma.tokenLog.create({
            data: {
                sessionId: session.id,
                doctorId: doctorIdBigInt,
                action: 'SESSION_PAUSE',
                meta: {
                    pausedAt: new Date().toISOString()
                }
            }
        });
        socket_1.socketManager.emitToDoctorRoom(doctorId, 'session:paused', {
            doctorId,
            sessionId: session.id.toString()
        });
        return {
            session: {
                id: updatedSession.id.toString(),
                status: updatedSession.status,
                currentToken: updatedSession.currentTokenNo,
                maxToken: updatedSession.maxTokenNo
            }
        };
    }
    async resumeSession(doctorId) {
        const doctorIdBigInt = BigInt(doctorId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const session = await db_1.prisma.session.findUnique({
            where: {
                doctorId_sessionDate: {
                    doctorId: doctorIdBigInt,
                    sessionDate: today
                }
            }
        });
        if (!session) {
            throw new Error('No session found for today');
        }
        if (session.status !== 'PAUSED') {
            throw new Error('Session is not paused');
        }
        const updatedSession = await db_1.prisma.session.update({
            where: { id: session.id },
            data: { status: 'ACTIVE' }
        });
        await db_1.prisma.tokenLog.create({
            data: {
                sessionId: session.id,
                doctorId: doctorIdBigInt,
                action: 'SESSION_RESUME',
                meta: {
                    resumedAt: new Date().toISOString()
                }
            }
        });
        socket_1.socketManager.emitToDoctorRoom(doctorId, 'session:resumed', {
            doctorId,
            sessionId: session.id.toString()
        });
        return {
            session: {
                id: updatedSession.id.toString(),
                status: updatedSession.status,
                currentToken: updatedSession.currentTokenNo,
                maxToken: updatedSession.maxTokenNo
            }
        };
    }
    async nextToken(doctorId) {
        const doctorIdBigInt = BigInt(doctorId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await db_1.prisma.$transaction(async (tx) => {
            const session = await tx.session.findUnique({
                where: {
                    doctorId_sessionDate: {
                        doctorId: doctorIdBigInt,
                        sessionDate: today
                    }
                }
            });
            if (!session) {
                throw new Error('No session found for today');
            }
            if (session.status !== 'ACTIVE') {
                throw new Error('Session is not active');
            }
            let currentTokenMarkedAsServed = false;
            if (session.currentTokenNo > 0) {
                const currentToken = await tx.token.findFirst({
                    where: {
                        sessionId: session.id,
                        tokenNo: session.currentTokenNo,
                        status: 'CALLED'
                    },
                    include: {
                        patient: {
                            select: {
                                id: true,
                                fullName: true
                            }
                        }
                    }
                });
                if (currentToken) {
                    await tx.token.update({
                        where: { id: currentToken.id },
                        data: {
                            status: 'SERVED',
                            servedAt: new Date()
                        }
                    });
                    currentTokenMarkedAsServed = true;
                    await tx.tokenLog.create({
                        data: {
                            tokenId: currentToken.id,
                            sessionId: session.id,
                            doctorId: doctorIdBigInt,
                            patientId: currentToken.patient.id,
                            action: 'SERVED',
                            meta: {
                                tokenNo: currentToken.tokenNo,
                                patientName: currentToken.patient.fullName,
                                servedAt: new Date().toISOString()
                            }
                        }
                    });
                    socket_1.socketManager.emitToUser(currentToken.patient.id.toString(), 'mytoken:updated', {
                        tokenId: currentToken.id.toString(),
                        status: 'SERVED',
                        servedAt: new Date().toISOString()
                    });
                    socket_1.socketManager.emitToDoctorRoom(doctorId, 'token:served', {
                        doctorId,
                        sessionId: session.id.toString(),
                        tokenNo: currentToken.tokenNo
                    });
                }
            }
            const nextTokenNo = session.currentTokenNo + 1;
            const token = await tx.token.findFirst({
                where: {
                    sessionId: session.id,
                    tokenNo: nextTokenNo,
                    status: 'WAITING'
                },
                include: {
                    patient: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    }
                }
            });
            if (!token) {
                const nextAvailableToken = await tx.token.findFirst({
                    where: {
                        sessionId: session.id,
                        tokenNo: {
                            gt: session.currentTokenNo
                        },
                        status: 'WAITING'
                    },
                    orderBy: {
                        tokenNo: 'asc'
                    },
                    include: {
                        patient: {
                            select: {
                                id: true,
                                fullName: true
                            }
                        }
                    }
                });
                if (!nextAvailableToken) {
                    if (currentTokenMarkedAsServed) {
                        return {
                            session: {
                                id: session.id.toString(),
                                currentToken: session.currentTokenNo,
                                maxToken: session.maxTokenNo,
                                status: session.status
                            },
                            message: 'Current token marked as SERVED. No more waiting tokens.'
                        };
                    }
                    throw new Error('No waiting tokens found');
                }
                const calledToken = await tx.token.update({
                    where: { id: nextAvailableToken.id },
                    data: {
                        status: 'CALLED',
                        calledAt: new Date()
                    }
                });
                await tx.session.update({
                    where: { id: session.id },
                    data: { currentTokenNo: nextAvailableToken.tokenNo }
                });
                await tx.tokenLog.create({
                    data: {
                        tokenId: calledToken.id,
                        sessionId: session.id,
                        doctorId: doctorIdBigInt,
                        patientId: nextAvailableToken.patient.id,
                        action: 'CALLED',
                        meta: {
                            tokenNo: nextAvailableToken.tokenNo,
                            patientName: nextAvailableToken.patient.fullName,
                            calledAt: new Date().toISOString()
                        }
                    }
                });
                socket_1.socketManager.emitToDoctorRoom(doctorId, 'token:next', {
                    doctorId,
                    sessionId: session.id.toString(),
                    currentToken: nextAvailableToken.tokenNo
                });
                socket_1.socketManager.emitToUser(nextAvailableToken.patient.id.toString(), 'mytoken:updated', {
                    tokenId: calledToken.id.toString(),
                    status: 'CALLED',
                    calledAt: calledToken.calledAt.toISOString()
                });
                return {
                    session: {
                        id: session.id.toString(),
                        currentToken: nextAvailableToken.tokenNo,
                        maxToken: session.maxTokenNo,
                        status: session.status
                    },
                    calledToken: {
                        id: calledToken.id.toString(),
                        tokenNo: calledToken.tokenNo,
                        patientName: nextAvailableToken.patient.fullName
                    }
                };
            }
            else {
                const calledToken = await tx.token.update({
                    where: { id: token.id },
                    data: {
                        status: 'CALLED',
                        calledAt: new Date()
                    }
                });
                await tx.session.update({
                    where: { id: session.id },
                    data: { currentTokenNo: nextTokenNo }
                });
                await tx.tokenLog.create({
                    data: {
                        tokenId: token.id,
                        sessionId: session.id,
                        doctorId: doctorIdBigInt,
                        patientId: token.patient.id,
                        action: 'CALLED',
                        meta: {
                            tokenNo: nextTokenNo,
                            patientName: token.patient.fullName,
                            calledAt: new Date().toISOString()
                        }
                    }
                });
                socket_1.socketManager.emitToDoctorRoom(doctorId, 'token:next', {
                    doctorId,
                    sessionId: session.id.toString(),
                    currentToken: nextTokenNo
                });
                socket_1.socketManager.emitToUser(token.patient.id.toString(), 'mytoken:updated', {
                    tokenId: token.id.toString(),
                    status: 'CALLED',
                    calledAt: calledToken.calledAt.toISOString()
                });
                return {
                    session: {
                        id: session.id.toString(),
                        currentToken: nextTokenNo,
                        maxToken: session.maxTokenNo,
                        status: session.status
                    },
                    calledToken: {
                        id: token.id.toString(),
                        tokenNo: nextTokenNo,
                        patientName: token.patient.fullName
                    }
                };
            }
        });
    }
    async endSession(doctorId) {
        const doctorIdBigInt = BigInt(doctorId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const session = await db_1.prisma.session.findUnique({
            where: {
                doctorId_sessionDate: {
                    doctorId: doctorIdBigInt,
                    sessionDate: today
                }
            }
        });
        if (!session) {
            throw new Error('No session found for today');
        }
        if (session.status === 'ENDED') {
            throw new Error('Session is already ended');
        }
        const updatedSession = await db_1.prisma.session.update({
            where: { id: session.id },
            data: {
                status: 'ENDED',
                endedAt: new Date()
            }
        });
        await db_1.prisma.tokenLog.create({
            data: {
                sessionId: session.id,
                doctorId: doctorIdBigInt,
                action: 'SESSION_END',
                meta: {
                    endedAt: new Date().toISOString()
                }
            }
        });
        socket_1.socketManager.emitToDoctorRoom(doctorId, 'session:ended', {
            doctorId,
            sessionId: session.id.toString()
        });
        return {
            session: {
                id: updatedSession.id.toString(),
                status: updatedSession.status,
                currentToken: updatedSession.currentTokenNo,
                maxToken: updatedSession.maxTokenNo,
                endedAt: updatedSession.endedAt
            }
        };
    }
    async getSessionAnalytics(doctorId, range) {
        const doctorIdBigInt = BigInt(doctorId);
        const now = new Date();
        let startDate;
        switch (range) {
            case 'today':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
                break;
        }
        const tokenCounts = await db_1.prisma.token.groupBy({
            by: ['status'],
            where: {
                session: {
                    doctorId: doctorIdBigInt,
                    sessionDate: {
                        gte: startDate
                    }
                }
            },
            _count: {
                status: true
            }
        });
        const analytics = {
            totalTokens: 0,
            served: 0,
            waiting: 0,
            called: 0,
            canceled: 0,
            noShow: 0
        };
        tokenCounts.forEach(count => {
            analytics.totalTokens += count._count.status;
            switch (count.status) {
                case 'SERVED':
                    analytics.served = count._count.status;
                    break;
                case 'WAITING':
                    analytics.waiting = count._count.status;
                    break;
                case 'CALLED':
                    analytics.called = count._count.status;
                    break;
                case 'CANCELED':
                    analytics.canceled = count._count.status;
                    break;
                case 'NO_SHOW':
                    analytics.noShow = count._count.status;
                    break;
            }
        });
        return analytics;
    }
}
exports.sessionService = new SessionService();
//# sourceMappingURL=session.service.js.map