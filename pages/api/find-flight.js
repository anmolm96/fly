// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const headers = {
  "Accept-Encoding": "gzip",
  Accept: "application/json",
  "Content-Type": "application/json",
  "Duffel-Version": "beta",
  Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
};

const createOffer = (body) => {
  const { origin, destination, date, seat } = JSON.parse(body);
  return {
    data: {
      slices: [
        {
          origin: origin,
          destination: destination,
          departure_date: date,
        },
      ],
      passengers: [
        {
          type: "adult",
        },
      ],
      cabin_class: seat,
    },
  };
};

export default async (req, res) => {
  if (req.method === "POST") {
    const body = createOffer(req.body);
    const offerReqData = await fetch(
      "https://api.duffel.com/air/offer_requests",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      }
    );
    const { data: offerReq } = await offerReqData.json();

    const offerData = await fetch(
      `https://api.duffel.com/air/offers?offer_request_id=${offerReq.id}&sort=total_amount&max_connections=0`,
      {
        method: "GET",
        headers: headers,
      }
    );
    const { data: offers } = await offerData.json();
    const offerIds = offers
      .filter((off) => off.owner.iata_code === "UA")
      .map((off) => off.id);
    const offerId = offerIds.length > 0 ? offerIds[0] : "";

    const singleOfferData = await fetch(
      `https://api.duffel.com/air/offers/${offerId}/`,
      {
        method: "GET",
        headers: headers,
      }
    );
    const { data: singleOffer } = await singleOfferData.json();

    res.status(200).json({
      ok: true,
      selectedOffer: singleOffer,
    });
  } else {
    res.status(405).end(`Method Not Allowed`);
  }
};
