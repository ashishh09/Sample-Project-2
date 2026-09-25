import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Bill, PaymentMethod, Order } from '../types';
import {
  Receipt,
  CheckCircle2,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
  Search,
  IndianRupee,
  Clock,
  ArrowRight,
  X,
  FileText,
  UtensilsCrossed,
  Sparkles,
  History,
} from 'lucide-react';

interface BillingPageProps {
  setCurrentTab: (tab: string) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({ setCurrentTab }) => {
  const {
    orders,
    bills,
    payments,
    generateBill,
    processPayment,
    settings,
    currentUser,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Checkout Modal
  const [checkoutBill, setCheckoutBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [upiRef, setUpiRef] = useState<string>('');
  const [checkoutError, setCheckoutError] = useState('');

  // Thermal Print Receipt Modal
  const [receiptToPrint, setReceiptToPrint] = useState<{
    bill: Bill;
    order?: Order;
    payment?: any;
  } | null>(null);

  // Orders that can be billed: orders that are NOT cancelled
  // For pending billing: orders whose bill is UNPAID or orders in READY/COMPLETED status without a paid bill
  const unpaidOrders = orders.filter((order) => {
    if (order.status === 'CANCELLED') return false;
    const existingBill = bills.find((b) => b.order_id === order.id);
    return !existingBill || existingBill.payment_status === 'UNPAID';
  });

  const paidBills = bills.filter((b) => b.payment_status === 'PAID');

  const handleOpenCheckout = (orderId: string) => {
    let bill: Bill | null | undefined = bills.find((b) => b.order_id === orderId);
    if (!bill) {
      bill = generateBill(orderId);
    }
    if (bill) {
      setCheckoutBill(bill);
      setPaymentMethod('Cash');
      setCashTendered(bill.grand_total.toString());
      setUpiRef('UPI/' + Math.floor(100000000 + Math.random() * 900000000));
      setCheckoutError('');
    }
  };

  const handleConfirmPayment = () => {
    if (!checkoutBill) return;
    setCheckoutError('');

    let tenderedNum: number | undefined = undefined;
    let changeNum: number | undefined = undefined;

    if (paymentMethod === 'Cash') {
      tenderedNum = parseFloat(cashTendered);
      if (isNaN(tenderedNum) || tenderedNum < checkoutBill.grand_total) {
        setCheckoutError(
          `Cash tendered must be at least ${settings.currency_symbol}${checkoutBill.grand_total}`
        );
        return;
      }
      changeNum = tenderedNum - checkoutBill.grand_total;
    }

    const res = processPayment(
      checkoutBill.id,
      paymentMethod,
      tenderedNum,
      changeNum,
      paymentMethod === 'UPI' ? upiRef : undefined
    );

    if (!res.success) {
      setCheckoutError(res.message || 'Payment processing failed');
      return;
    }

    // Open receipt modal for printing
    const relatedOrder = orders.find((o) => o.id === checkoutBill.order_id);
    const relatedPayment = payments.find((p) => p.bill_id === checkoutBill.id);

    setReceiptToPrint({
      bill: { ...checkoutBill, payment_status: 'PAID' },
      order: relatedOrder,
      payment: relatedPayment,
    });

    setCheckoutBill(null);
  };

  const handleOpenPrintPreview = (bill: Bill) => {
    const relatedOrder = orders.find((o) => o.id === bill.order_id);
    const relatedPayment = payments.find((p) => p.bill_id === bill.id);
    setReceiptToPrint({
      bill,
      order: relatedOrder,
      payment: relatedPayment,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Tabs */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Billing & Point of Sale Counter
            </h3>
            <p className="text-xs text-slate-500">
              Process customer payments, generate GST invoices, and automatically release dining
              tables
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Pending Billing ({unpaidOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Paid Invoices History ({paidBills.length})
          </button>
        </div>
      </div>

      {/* PENDING BILLING VIEW */}
      {activeTab === 'PENDING' ? (
        <div className="space-y-4">
          {unpaidOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No Unpaid Orders Pending!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All customer dining orders have been paid and reconciled. When food orders are
                placed, they will show up here for invoice settlement.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unpaidOrders.map((order) => {
                const subtotal = order.subtotal;
                const gstAmount = Math.round((subtotal * settings.gst_rate) / 100);
                const grandTotal = subtotal + gstAmount;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                        <div>
                          <span className="font-extrabold text-base text-slate-900 font-mono">
                            {order.order_number}
                          </span>
                          <p className="font-bold text-sm text-slate-700">{order.table_number}</p>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="py-3 space-y-1.5 border-b border-slate-100 max-h-36 overflow-y-auto">
                        {order.items.map((i) => (
                          <div
                            key={i.id}
                            className="flex items-center justify-between text-xs text-slate-600"
                          >
                            <span>
                              {i.quantity}x {i.name}
                            </span>
                            <span className="font-mono font-medium text-slate-800">
                              {settings.currency_symbol}
                              {i.price * i.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Financial breakdown */}
                      <div className="pt-3 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Subtotal:</span>
                          <span className="font-mono">
                            {settings.currency_symbol}
                            {subtotal}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>GST ({settings.gst_rate}%):</span>
                          <span className="font-mono text-emerald-600">
                            +{settings.currency_symbol}
                            {gstAmount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
                          <span>Grand Total:</span>
                          <span className="font-mono text-blue-600">
                            {settings.currency_symbol}
                            {grandTotal}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenCheckout(order.id)}
                      className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Generate Bill & Checkout</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* PAID INVOICES HISTORY VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">GST (5%)</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paidBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No invoices settled yet.
                    </td>
                  </tr>
                ) : (
                  paidBills.map((bill) => {
                    const payment = payments.find((p) => p.bill_id === bill.id);
                    const date = new Date(bill.created_at);

                    return (
                      <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {bill.bill_number}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {bill.order_number}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {bill.table_number}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {settings.currency_symbol}
                          {bill.subtotal}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-600">
                          {settings.currency_symbol}
                          {bill.gst_amount}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {settings.currency_symbol}
                          {bill.grand_total}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {payment ? payment.method : 'Paid'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenPrintPreview(bill)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span>Settle Bill: {checkoutBill.bill_number}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {checkoutBill.table_number} • Order {checkoutBill.order_number}
                </p>
              </div>
              <button
                onClick={() => setCheckoutBill(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {checkoutError}
              </div>
            )}

            {/* Bill Summary Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 mb-5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Food & Beverage Subtotal:</span>
                <span className="font-mono font-semibold">
                  {settings.currency_symbol}
                  {checkoutBill.subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Government GST ({checkoutBill.gst_rate}%):</span>
                <span className="font-mono font-semibold text-emerald-600">
                  +{settings.currency_symbol}
                  {checkoutBill.gst_amount}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-base font-extrabold text-slate-900">
                <span>Net Payable:</span>
                <span className="font-mono text-blue-600 text-lg">
                  {settings.currency_symbol}
                  {checkoutBill.grand_total}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Payment Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { method: 'Cash', icon: Banknote },
                      { method: 'UPI', icon: QrCode },
                      { method: 'Card', icon: CreditCard },
                    ] as const
                  ).map((m) => {
                    const Icon = m.icon;
                    const isSel = paymentMethod === m.method;
                    return (
                      <button
                        key={m.method}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.method);
                          if (m.method === 'Cash') {
                            setCashTendered(checkoutBill.grand_total.toString());
                          }
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSel
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{m.method}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Fields based on method */}
              {paymentMethod === 'Cash' && (
                <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">
                      Cash Received ({settings.currency_symbol}) *
                    </label>
                    <input
                      type="number"
                      min={checkoutBill.grand_total}
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder="e.g. 500, 1000"
                      className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono font-bold"
                    />
                  </div>

                  {parseFloat(cashTendered) >= checkoutBill.grand_total && (
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800 bg-emerald-100/70 p-2 rounded-lg">
                      <span>Change to Return:</span>
                      <span className="font-mono text-sm">
                        {settings.currency_symbol}
                        {(parseFloat(cashTendered) - checkoutBill.grand_total).toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 text-center space-y-2">
                  <div className="w-28 h-28 bg-white p-2 rounded-lg border border-blue-200 mx-auto flex items-center justify-center shadow-2xs">
                    <QrCode className="w-24 h-24 text-slate-800" />
                  </div>
                  <p className="text-xs font-mono font-semibold text-blue-900">
                    UPI ID: spicebistro@okaxis
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Scan using Google Pay, PhonePe, or Paytm to pay {settings.currency_symbol}
                    {checkoutBill.grand_total}
                  </p>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                  <p className="font-bold">Swipe / Tap POS Terminal</p>
                  <p className="text-[11px] text-purple-700">
                    Insert debit/credit card into the restaurant card machine and confirm auth.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => setCheckoutBill(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment & Release Table</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THERMAL RECEIPT PRINT MODAL */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Customer Receipt</span>
              </span>
              <button
                onClick={() => setReceiptToPrint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Paper Container */}
            <div
              id="printable-receipt"
              className="bg-amber-50/20 p-5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 space-y-3 overflow-y-auto flex-1"
            >
              {/* Receipt Header */}
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                  {settings.restaurant_name}
                </h4>
                <p className="text-[10px] text-slate-500">{settings.tagline}</p>
                <p className="text-[10px] text-slate-500">{settings.address}</p>
                <p className="text-[10px] text-slate-500">Tel: {settings.phone}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  GSTIN: 27AABCS1429B1Z8
                </p>
              </div>

              {/* Meta */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">{receiptToPrint.bill.bill_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order No:</span>
                  <span>{receiptToPrint.bill.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span className="font-bold">{receiptToPrint.bill.table_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(receiptToPrint.bill.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{currentUser?.name || 'Staff'}</span>
                </div>
              </div>

              {/* Line Items */}
              <div className="border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-slate-200">
                  <span>ITEM</span>
                  <span>QTY</span>
                  <span>AMT</span>
                </div>
                {receiptToPrint.order?.items.map((i) => (
                  <div key={i.id} className="flex justify-between text-[11px] pt-1">
                    <span className="truncate max-w-[140px]">{i.name}</span>
                    <span>{i.quantity}</span>
                    <span>
                      {settings.currency_symbol}
                      {i.price * i.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {settings.currency_symbol}
                    {receiptToPrint.bill.subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (2.5%):</span>
                  <span>
                    {settings.currency_symbol}
                    {(receiptToPrint.bill.gst_amount / 2).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%):</span>
                  <span>
                    {settings.currency_symbol}
                    {(receiptToPrint.bill.gst_amount / 2).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>GRAND TOTAL:</span>
                  <span>
                    {settings.currency_symbol}
                    {receiptToPrint.bill.grand_total}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-bold">
                    {receiptToPrint.payment?.method || 'Cash/Electronic'}
                  </span>
                </div>
                {receiptToPrint.payment?.cash_tendered && (
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>
                      {settings.currency_symbol}
                      {receiptToPrint.payment.cash_tendered}
                    </span>
                  </div>
                )}
                {receiptToPrint.payment?.change_returned !== undefined && (
                  <div className="flex justify-between">
                    <span>Change Returned:</span>
                    <span>
                      {settings.currency_symbol}
                      {receiptToPrint.payment.change_returned}
                    </span>
                  </div>
                )}
                {receiptToPrint.payment?.transaction_ref && (
                  <div className="flex justify-between">
                    <span>Ref No:</span>
                    <span className="truncate max-w-[130px]">
                      {receiptToPrint.payment.transaction_ref}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-500 pt-1">
                <p>Thank you for dining with us!</p>
                <p>Have a wonderful day!</p>
                <p className="mt-1 text-[9px] text-slate-400">
                  Software Engineering Project Prototype
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-3">
              <button
                type="button"
                onClick={() => setReceiptToPrint(null)}
                className="flex-1 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
