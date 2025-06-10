
export type PaymentStatus =
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELED'
    | 'ROLLBACK_REQUESTED'
    | 'REFUNDED' ;

export interface PaymentItem {
  id: string;
  lectureId: string;
  lectureName: string;
  amount: number;
  paymentDate: string;
  status: PaymentStatus;
}

export interface PaymentRequest {
  productId: number;
  merchantUid: string;
  impUid: string;
  productPrice: number;
  paidAmount: number;
  paymentMethod: string;
}

export type RollbackFailure = {
  id: number;
  purchaseId: number;
  impUid: string;
  amount: number;
  createdAt: string;
};

export type PurchaseFailure = {
  id: number;
  userId: number;
  productId: number;
  merchantUid: string;
  impUid: string;
  paidAmount: number;
  reason: string;
  createdAt: string;
};

export type CancelFailure = {
  id: number;
  purchaseId: number;
  createdAt: string;
};