import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/apiResponse';
import prisma from '@/lib/prisma';
import { SupportTicketCreateSchema } from '@/validators';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const tickets = await prisma.supportTicket.findMany({
      where: user.role === 'ADMIN' ? {} : { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { username: true, role: true } } },
        },
      },
    });
    return jsonSuccess(tickets);
  } catch (err: any) {
    return jsonError(err.message || 'Failed to fetch tickets', 'UNAUTHORIZED', 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Check if reply to existing ticket or new ticket
    if (body.ticketId) {
      const { ticketId, message, attachmentUrl } = body;
      if (!message) return jsonError('Message cannot be empty');

      const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) return jsonError('Ticket not found');
      if (ticket.userId !== user.id && user.role !== 'ADMIN') return jsonError('Unauthorized');

      const msg = await prisma.ticketMessage.create({
        data: {
          ticketId,
          senderId: user.id,
          senderRole: user.role,
          message,
          attachmentUrl: attachmentUrl || null,
        },
      });

      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: user.role === 'ADMIN' ? 'RESOLVED' : 'IN_PROGRESS',
          updatedAt: new Date(),
        },
      });

      return jsonSuccess(msg, 'Reply posted successfully');
    }

    const validated = SupportTicketCreateSchema.parse(body);
    const ticketNumber = generateOrderNumber('TCK');

    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.supportTicket.create({
        data: {
          ticketNumber,
          userId: user.id,
          subject: validated.subject,
          category: validated.category,
          orderId: validated.orderId || null,
          status: 'OPEN',
        },
      });

      await tx.ticketMessage.create({
        data: {
          ticketId: newTicket.id,
          senderId: user.id,
          senderRole: user.role,
          message: validated.description,
          attachmentUrl: validated.attachmentUrl || null,
        },
      });

      return newTicket;
    });

    return jsonSuccess(ticket, 'Support ticket created successfully');
  } catch (err: any) {
    return jsonError(err.message || 'Ticket creation failed');
  }
}
