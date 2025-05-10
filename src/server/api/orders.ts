import { UserRole } from "@prisma/client";
import { auth } from "~/server/auth";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
} from "~/server/services/order.service";
import {
  createOrderSchema,
  updateOrderSchema,
  cancelOrderSchema,
  orderFilterSchema,
} from "~/lib/validations/order.schema";

/**
 * Handle creating a new order
 */
export async function handleCreateOrder(data: unknown) {
  // Validate input data
  const result = createOrderSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors,
    };
  }

  try {
    // Get the current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Create the order
    const order = await createOrder({
      userId: session.user.id,
      eventId: result.data.eventId,
      items: result.data.items,
      promoCode: result.data.promoCode,
    });

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

/**
 * Handle getting orders with filtering
 */
export async function handleGetOrders(params: unknown) {
  // Validate filter params
  const result = orderFilterSchema.safeParse(params);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors,
    };
  }

  try {
    // Get the current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // If not admin, restrict to user's own orders
    const filterParams = { ...result.data };
    if (session.user.role !== UserRole.ADMIN) {
      filterParams.userId = session.user.id;
    }

    // Get orders with filters
    const orders = await getOrders(filterParams);

    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Error getting orders:", error);
    return {
      success: false,
      error: "Failed to get orders",
    };
  }
}

/**
 * Handle getting an order by ID
 */
export async function handleGetOrderById(id: string) {
  try {
    // Get the current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the order
    const order = await getOrderById(id);
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Check if user has permission to view this order
    if (session.user.role !== UserRole.ADMIN && order.userId !== session.user.id) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error(`Error getting order ${id}:`, error);
    return {
      success: false,
      error: "Failed to get order",
    };
  }
}

/**
 * Handle updating an order
 */
export async function handleUpdateOrder(id: string, data: unknown) {
  // Validate input data
  const result = updateOrderSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors,
    };
  }

  try {
    // Get the current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if order exists
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Check if user has permission to update this order
    if (session.user.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    // Update the order
    const updatedOrder = await updateOrder(id, result.data);

    return {
      success: true,
      data: updatedOrder,
    };
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    return {
      success: false,
      error: "Failed to update order",
    };
  }
}

/**
 * Handle cancelling an order
 */
export async function handleCancelOrder(id: string, data: unknown) {
  // Validate input data
  const result = cancelOrderSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors,
    };
  }

  try {
    // Get the current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if order exists
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Check if user has permission to cancel this order
    if (session.user.role !== UserRole.ADMIN && existingOrder.userId !== session.user.id) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    // Cancel the order
    const cancelledOrder = await cancelOrder(id);

    return {
      success: true,
      data: cancelledOrder,
      message: "Order cancelled successfully",
    };
  } catch (error) {
    console.error(`Error cancelling order ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    };
  }
}