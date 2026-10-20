import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertCircle } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { toast } from '@/providers/ToastProvider';
import orderService from '@/services/order.service';
import shipmentService from '@/services/shipment.service';

import OrderDetailHeader from './OrderDetailHeader';
import OrderTimelineStepper from './OrderTimelineStepper';
import OrderFulfillmentCard from './OrderFulfillmentCard';
import OrderPaymentCard from './OrderPaymentCard';
import OrderHistoryTimeline from './OrderHistoryTimeline';
import OrderSidebarInfo from './OrderSidebarInfo';

import OrderStatusModal from '../components/OrderStatusModal';
import OrderCancelModal from '../components/OrderCancelModal';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [statusModalState, setStatusModalState] = useState({
    isOpen: false,
    order: null,
    nextStatus: null,
  });
  const [cancelModalState, setCancelModalState] = useState({
    isOpen: false,
    order: null,
  });

  const fetchOrderDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      let orderData = null;

      // 1. Thử fetch bằng getOrderById(id)
      try {
        const res = await orderService.getOrderById(id);
        orderData = res?.data || res;
      } catch (err) {
        // 2. Nếu thất bại (có thể do id là mã đơn orderCode), thử tìm kiếm bằng getAllOrders
        const searchRes = await orderService.getAllOrders({ search: id, limit: 1 });
        if (searchRes?.data && searchRes.data.length > 0) {
          orderData = searchRes.data[0];
        } else {
          throw err;
        }
      }

      if (orderData) {
        setOrder(orderData);

        // 3. Tải thông tin vận đơn đối tác tương ứng theo mã đơn
        if (orderData.orderCode) {
          try {
            const shipMap = await shipmentService.getShipmentsByOrderCodes([orderData.orderCode]);
            setShipment(shipMap[orderData.orderCode] || null);
          } catch (shipErr) {
            console.warn('Lỗi lấy vận đơn tương ứng:', shipErr.message);
          }
        }
      }
    } catch (err) {
      toast.error('Không tìm thấy đơn hàng', { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Modal Handlers
  const handleOpenStatusModal = (ord, nextStatus) => {
    setStatusModalState({ isOpen: true, order: ord, nextStatus });
  };

  const handleCloseStatusModal = () => {
    setStatusModalState({ isOpen: false, order: null, nextStatus: null });
  };

  const handleOpenCancelModal = (ord) => {
    setCancelModalState({ isOpen: true, order: ord });
  };

  const handleCloseCancelModal = () => {
    setCancelModalState({ isOpen: false, order: null });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-7 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground">Đang tải chi tiết đơn hàng...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-[6px] border border-border bg-card p-12 text-center max-w-lg mx-auto my-12 space-y-3">
        <AlertCircle className="size-10 text-muted-foreground/30 mx-auto" />
        <h3 className="text-sm font-bold text-foreground">Không tìm thấy đơn hàng</h3>
        <p className="text-xs text-muted-foreground">
          Đơn hàng không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate('/orders')}
          className="rounded-[6px] text-xs cursor-pointer"
        >
          <ArrowLeft className="size-3.5 mr-1" />
          Quay lại danh sách đơn
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <OrderDetailHeader
        order={order}
        onOpenStatusModal={handleOpenStatusModal}
        onOpenCancelModal={handleOpenCancelModal}
        onPrint={handlePrint}
      />

      {/* Horizontal timeline stepper */}
      <OrderTimelineStepper order={order} shipment={shipment} />

      {/* 2-Column Sapo Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols): Fulfillment, Payment, History */}
        <div className="lg:col-span-8 space-y-5">
          <OrderFulfillmentCard order={order} shipment={shipment} />
          <OrderPaymentCard order={order} />
          <OrderHistoryTimeline order={order} shipment={shipment} />
        </div>

        {/* Right Column (4 cols): Channel, Customer, Note, Extra info */}
        <div className="lg:col-span-4 space-y-5">
          <OrderSidebarInfo
            order={order}
            onOpenCancelModal={handleOpenCancelModal}
          />
        </div>
      </div>

      {/* Status Update Modal */}
      {statusModalState.isOpen && (
        <OrderStatusModal
          isOpen={statusModalState.isOpen}
          order={statusModalState.order}
          nextStatus={statusModalState.nextStatus}
          onClose={handleCloseStatusModal}
          onSuccess={() => {
            handleCloseStatusModal();
            fetchOrderDetail();
          }}
        />
      )}

      {/* Cancel Order Modal */}
      {cancelModalState.isOpen && (
        <OrderCancelModal
          isOpen={cancelModalState.isOpen}
          order={cancelModalState.order}
          onClose={handleCloseCancelModal}
          onSuccess={() => {
            handleCloseCancelModal();
            fetchOrderDetail();
          }}
        />
      )}
    </div>
  );
}
