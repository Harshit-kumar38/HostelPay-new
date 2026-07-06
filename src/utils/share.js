// Share utilities for HostelPay settlement messages

export function generateSettleMessage(contactName, amount, iOweThem, myName) {
  const formattedAmount = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0 }).format(amount);
  if (iOweThem) {
    return `Hey ${contactName}, according to HostelPay, I owe you ₹${formattedAmount}. Let me know when you're free to settle!`;
  } else {
    return `Hey ${contactName}, according to HostelPay, you owe me ₹${formattedAmount}. Let's settle whenever you're free. 😊`;
  }
}

export function whatsappUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
