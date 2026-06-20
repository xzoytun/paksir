export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Memastikan Midtrans nembak ke path yang benar
    if (request.method === "POST" && url.pathname === "/midtrans-webhook") {
      const notification = await request.json();
      
      // LOGIKA REVIEW SIGNATURE & PROSES TRANSAKSI DI SINI
      console.log("Order ID masuk:", notification.order_id);

      return new Response("OK", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  }
};
