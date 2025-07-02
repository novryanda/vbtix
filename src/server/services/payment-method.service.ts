import { prisma } from "~/server/db";
import type { PaymentMethod, TicketTypePaymentMethod } from "~/lib/types";

/**
 * Service layer for PaymentMethod operations
 * Handles business logic for payment method management
 */
export class PaymentMethodService {
  /**
   * Get all active payment methods
   */
  async findAllActive(): Promise<PaymentMethod[]> {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return paymentMethods.map(this.mapToPaymentMethod);
  }

  /**
   * Get all payment methods (including inactive)
   */
  async findAll(): Promise<PaymentMethod[]> {
    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return paymentMethods.map(this.mapToPaymentMethod);
  }

  /**
   * Get payment method by ID
   */
  async findById(id: string): Promise<PaymentMethod | null> {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
    });

    return paymentMethod ? this.mapToPaymentMethod(paymentMethod) : null;
  }

  /**
   * Get payment method by code
   */
  async findByCode(code: string): Promise<PaymentMethod | null> {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { code },
    });

    return paymentMethod ? this.mapToPaymentMethod(paymentMethod) : null;
  }

  /**
   * Get allowed payment methods for a ticket type
   */
  async findAllowedForTicketType(ticketTypeId: string): Promise<PaymentMethod[]> {
    const ticketTypePaymentMethods = await prisma.ticketTypePaymentMethod.findMany({
      where: {
        ticketTypeId,
      },
      include: {
        paymentMethod: true,
      },
    });

    return ticketTypePaymentMethods
      .filter(ttpm => ttpm.paymentMethod.isActive)
      .map(ttpm => this.mapToPaymentMethod(ttpm.paymentMethod));
  }

  /**
   * Create a new payment method
   */
  async create(data: {
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<PaymentMethod> {
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });

    return this.mapToPaymentMethod(paymentMethod);
  }

  /**
   * Update an existing payment method
   */
  async update(
    id: string,
    data: {
      code?: string;
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<PaymentMethod> {
    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data,
    });

    return this.mapToPaymentMethod(paymentMethod);
  }

  /**
   * Delete a payment method
   */
  async delete(id: string): Promise<void> {
    await prisma.paymentMethod.delete({
      where: { id },
    });
  }

  /**
   * Set allowed payment methods for a ticket type
   */
  async setAllowedForTicketType(
    ticketTypeId: string,
    paymentMethodIds: string[]
  ): Promise<TicketTypePaymentMethod[]> {
    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // First, delete existing associations
      await tx.ticketTypePaymentMethod.deleteMany({
        where: {
          ticketTypeId,
        },
      });

      // Then, create new associations
      const associations = await tx.ticketTypePaymentMethod.createMany({
        data: paymentMethodIds.map(paymentMethodId => ({
          ticketTypeId,
          paymentMethodId,
        })),
      });

      // Return the created associations with relations
      const createdAssociations = await tx.ticketTypePaymentMethod.findMany({
        where: {
          ticketTypeId,
        },
        include: {
          ticketType: true,
          paymentMethod: true,
        },
      });

      return createdAssociations.map(this.mapToTicketTypePaymentMethod);
    });
  }

  /**
   * Validate if a payment method is allowed for a ticket type
   */
  async isPaymentMethodAllowedForTicketType(
    ticketTypeId: string,
    paymentMethodCode: string
  ): Promise<boolean> {
    const association = await prisma.ticketTypePaymentMethod.findFirst({
      where: {
        ticketTypeId,
        paymentMethod: {
          code: paymentMethodCode,
          isActive: true,
        },
      },
    });

    return !!association;
  }

  /**
   * Map Prisma PaymentMethod to domain PaymentMethod
   */
  private mapToPaymentMethod(prismaPaymentMethod: any): PaymentMethod {
    return {
      id: prismaPaymentMethod.id,
      code: prismaPaymentMethod.code,
      name: prismaPaymentMethod.name,
      description: prismaPaymentMethod.description,
      isActive: prismaPaymentMethod.isActive,
      createdAt: prismaPaymentMethod.createdAt.toISOString(),
      updatedAt: prismaPaymentMethod.updatedAt.toISOString(),
    };
  }

  /**
   * Map Prisma TicketTypePaymentMethod to domain TicketTypePaymentMethod
   */
  private mapToTicketTypePaymentMethod(prismaAssociation: any): TicketTypePaymentMethod {
    return {
      id: prismaAssociation.id,
      ticketTypeId: prismaAssociation.ticketTypeId,
      paymentMethodId: prismaAssociation.paymentMethodId,
      createdAt: prismaAssociation.createdAt.toISOString(),
      ticketType: prismaAssociation.ticketType ? {
        id: prismaAssociation.ticketType.id,
        eventId: prismaAssociation.ticketType.eventId,
        name: prismaAssociation.ticketType.name,
        description: prismaAssociation.ticketType.description,
        price: Number(prismaAssociation.ticketType.price),
        currency: prismaAssociation.ticketType.currency,
        quantity: prismaAssociation.ticketType.quantity,
        sold: prismaAssociation.ticketType.sold,
        maxPerPurchase: prismaAssociation.ticketType.maxPerPurchase,
        isVisible: prismaAssociation.ticketType.isVisible,
        allowTransfer: prismaAssociation.ticketType.allowTransfer,
        ticketFeatures: prismaAssociation.ticketType.ticketFeatures,
        perks: prismaAssociation.ticketType.perks,
        earlyBirdDeadline: prismaAssociation.ticketType.earlyBirdDeadline?.toISOString(),
        saleStartDate: prismaAssociation.ticketType.saleStartDate?.toISOString(),
        saleEndDate: prismaAssociation.ticketType.saleEndDate?.toISOString(),
        imageUrl: prismaAssociation.ticketType.imageUrl,
        imagePublicId: prismaAssociation.ticketType.imagePublicId,
        createdAt: prismaAssociation.ticketType.createdAt.toISOString(),
        updatedAt: prismaAssociation.ticketType.updatedAt.toISOString(),
      } : undefined,
      paymentMethod: prismaAssociation.paymentMethod ? this.mapToPaymentMethod(prismaAssociation.paymentMethod) : undefined,
    };
  }
}

// Export singleton instance
export const paymentMethodService = new PaymentMethodService();
