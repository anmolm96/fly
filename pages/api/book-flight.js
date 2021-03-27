// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const headers = {
  "Accept-Encoding": "gzip",
  Accept: "application/json",
  "Content-Type": "application/json",
  "Duffel-Version": "beta",
  Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
};

const createOrder = (body) => {
  const {
    amount,
    currency,
    offerId,
    passengerId,
    firstName,
    lastName,
    email,
    phone,
    gender,
    birth_date,
  } = JSON.parse(body);
  return {
    data: {
      selected_offers: [offerId],
      payments: [
        {
          type: "balance",
          currency: currency,
          amount: amount,
        },
      ],
      passengers: [
        {
          phone_number: phone,
          email: email,
          born_on: birth_date,
          title: gender === "m" ? "mr" : "mrs",
          gender: gender,
          family_name: lastName,
          given_name: firstName,
          id: passengerId,
        },
      ],
    },
  };
};

export default async (req, res) => {
  if (req.method === "POST") {
    const body = createOrder(req.body);
    const orderReqData = await fetch("https://api.duffel.com/air/orders", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const orderData = await orderReqData.json();

    res.status(200).json({
      ok: true,
      bookedOrder: orderData,
    });
  } else {
    res.status(405).end(`Method Not Allowed`);
  }
};
