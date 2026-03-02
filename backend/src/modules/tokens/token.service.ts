import { prisma } from '@/lib/db';
import { socketManager } from '@/lib/socket';
import { BookTokenInput } from '@/lib/validators';

class TokenService {
  // Book a new token for a patient
  async bookToken(patientId: string, data: BookTokenInput) {
    const patientIdBigInt = BigInt(patientId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.$transaction(async (tx) => {
      // Get or create today's session for the doctor
      let session = await tx.session.findUnique({
        where: {
          doctorId_sessionDate: {
            doctorId: data.doctorId,
            sessionDate: today
          }
        }
      });

      if (!session) {
        // Create new session for today
        session = await tx.session.create({
          data: {
            doctorId: data.doctorId,
            sessionDate: today,
            status: 'NOT_STARTED'
          }
        });
      }

      // Check if session is ended
      if (session.status === 'ENDED') {
        throw new Error('Doctor session has ended for today');
      }

      // Check if patient already has an active token for this session
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

      // Lock the session for update
      const lockedSession = await tx.session.findUnique({
        where: { id: session.id },
        // Use FOR UPDATE to prevent race conditions
      });

      if (!lockedSession) {
        throw new Error('Session not found');
      }

      // Count existing tokens to determine next token number
      const tokenCount = await tx.token.count({
        where: { sessionId: session.id }
      });

      const nextTokenNo = tokenCount + 1;

      // Check if we've reached the maximum tokens allowed
      if (nextTokenNo > lockedSession.maxTokenNo) {
        throw new Error(`Session is full. Maximum ${lockedSession.maxTokenNo} tokens allowed.`);
      }

      // Create the token
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

      // Note: We do NOT update maxTokenNo here anymore
      // maxTokenNo is the limit, not a counter

      // Log the booking
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

      // Calculate tokens ahead
      const tokensAhead = Math.max(0, nextTokenNo - session.currentTokenNo - 1);

      // Get queue length for broadcasting
      const queueLength = await tx.token.count({
        where: {
          sessionId: session.id,
          status: {
            in: ['WAITING', 'CALLED']
          }
        }
      });

      // Emit real-time events
      socketManager.emitToDoctorRoom(data.doctorId.toString(), 'token:booked', {
        doctorId: data.doctorId.toString(),
        sessionId: session.id.toString(),
        tokenNo: nextTokenNo,
        patientId: patientId,
        maxToken: nextTokenNo,
        queueLength
      });

      socketManager.emitToUser(patientId, 'mytoken:created', {
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

  // Get patient's tokens
  async getMyTokens(patientId: string, doctorId?: bigint, status?: string) {
    const patientIdBigInt = BigInt(patientId);

    const tokens = await prisma.token.findMany({
      where: {
        patientId: patientIdBigInt,
        ...(doctorId && {
          session: {
            doctorId: doctorId
          }
        }),
        ...(status && { status: status as any })
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

    // Calculate tokens ahead for each waiting token
    const tokensWithAhead = await Promise.all(
      tokens.map(async (token) => {
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
      })
    );

    return tokensWithAhead;
  }

  // Get doctor's session info for public viewing
  async getDoctorSession(doctorId: bigint, patientId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const session = await prisma.session.findUnique({
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
      // Return default session state
      const doctor = await prisma.doctor.findUnique({
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

    // Get queue length
    const queueLength = await prisma.token.count({
      where: {
        sessionId: session.id,
        status: {
          in: ['WAITING', 'CALLED']
        }
      }
    });

    // Get patient's token for this session if authenticated
    let myToken = null;
    if (patientId) {
      const patientToken = await prisma.token.findFirst({
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

  // Get all tokens for a session (for doctors)
  async getSessionTokens(sessionId: string) {
    const sessionIdBigInt = BigInt(sessionId);

    const tokens = await prisma.token.findMany({
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

export const tokenService = new TokenService();