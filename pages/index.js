import { useState } from "react";
import DatePicker from "react-date-picker/dist/entry.nostyle";
import { convertYouTubeDuration } from "duration-iso-8601";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Head from "next/head";

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState("DEL-SFO");
  const [reqState, setReqState] = useState("unfetched");
  const [date, setDate] = useState(new Date());
  const [seatType, setSeatType] = useState("business");
  const [flightData, setFlightData] = useState(null);
  const [bookedData, setBookedData] = useState(null);

  const findFlight = async () => {
    setReqState("loading");
    const resp = await fetch("/api/find-flight", {
      method: "POST",
      body: JSON.stringify({
        date: date.toISOString().split("T")[0],
        origin: selectedRoute.split("-")[0],
        destination: selectedRoute.split("-")[1],
        seat: seatType,
      }),
    });
    const { selectedOffer } = await resp.json();
    setReqState("selected");
    setFlightData(selectedOffer);
  };

  const bookFlight = async ({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
  }) => {
    setReqState("loading");
    const resp = await fetch("/api/book-flight", {
      method: "POST",
      body: JSON.stringify({
        amount: flightData?.total_amount,
        currency: flightData?.total_currency,
        offerId: flightData?.id,
        passengerId: flightData?.passengers[0].id,
        firstName,
        lastName,
        email,
        phone: `+${phone}`,
        birth_date: dob.toISOString().split("T")[0],
        gender,
      }),
    });
    const { bookedOrder } = await resp.json();
    setReqState("booked");
    setBookedData(bookedOrder);
  };

  return (
    <div className="flex justify-center flex-col items-center">
      <Head>
        <title>{"DEL <-> SFO"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mt-4 p-4 items-center" style={{ width: "600px" }}>
        <div className="mb-8 text-center text-2xl">
          Fly direct between Delhi and SFO
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex rounded-lg text-lg mb-4" role="group">
              <button
                className={`${
                  selectedRoute === "DEL-SFO" ? "bg-blue-500" : "bg-blue-400"
                } text-white hover:bg-blue-500 rounded-l-lg px-4 py-2 mx-0 outline-none focus:shadow-outline`}
                onClick={() => setSelectedRoute("DEL-SFO")}
              >
                DEL - SFO
              </button>
              <button
                className={`${
                  selectedRoute === "SFO-DEL" ? "bg-blue-500" : "bg-blue-400"
                } text-white hover:bg-blue-500 rounded-r-lg px-4 py-2 mx-0 outline-none focus:shadow-outline`}
                onClick={() => setSelectedRoute("SFO-DEL")}
              >
                SFO - DEL
              </button>
            </div>
            <DatePicker onChange={setDate} value={date} minDate={new Date()} />
            <select
              className="mt-4 p-2 border border-blue-500"
              value={seatType}
              onChange={(e) => setSeatType(e.target.value)}
            >
              <option value="business">Business</option>
              <option value="economy">Economy</option>
            </select>
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={findFlight}
              disabled={reqState === "loading"}
            >
              Find a Flight
            </button>
          </div>
        </div>
      </div>
      <div
        className="m-4 p-4 border border-blue-500"
        style={{ width: "600px" }}
      >
        {reqState === "unfetched" && (
          <div className="text-center">No flights</div>
        )}
        {reqState === "loading" && (
          <div className="text-center">Loading...</div>
        )}
        {reqState === "selected" && flightData && (
          <BookFlight
            selectedRoute={selectedRoute}
            flightData={flightData}
            reqState={reqState}
            bookFlight={bookFlight}
          />
        )}
        {reqState === "booked" && bookedData && (
          <div className="flex flex-col justify-center items-center">
            <div className="text-center">
              Your flight is booked, check your email for the confirmation.
            </div>
            <div>Booking Refernce: {bookedData.data.booking_reference}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const BookFlight = ({ selectedRoute, flightData, reqState, bookFlight }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState(new Date());
  const [gender, setGender] = useState("f");
  return (
    <div className="flex flex-col justify-center items-center">
      <div>
        From {selectedRoute.split("-")[0]} To {selectedRoute.split("-")[1]}
      </div>
      <div>
        Flight number:{" "}
        {flightData.slices[0].segments[0].marketing_carrier.iata_code}{" "}
        {flightData.slices[0].segments[0].marketing_carrier_flight_number}
      </div>
      <div>
        Total cost (in {flightData?.total_currency}): {flightData?.total_amount}
      </div>
      <div>
        Departing ({flightData.slices[0].segments[0].origin.city_name}):{" "}
        {new Date(
          flightData.slices[0].segments[0].departing_at
        ).toLocaleString()}
      </div>
      <div>
        Arriving ({flightData.slices[0].segments[0].destination.city_name}
        ):{" "}
        {new Date(
          flightData.slices[0].segments[0].arriving_at
        ).toLocaleString()}
      </div>
      <div>
        Flight Duration:{" "}
        {convertYouTubeDuration(flightData.slices[0].segments[0].duration)} hrs
      </div>
      <div
        className="flex flex-col border border-blue-500 p-2 mt-4"
        style={{ width: "400px" }}
      >
        <div>Enter Details:</div>
        <input
          className="mt-2 p-1 border"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
        />
        <input
          className="mt-2 p-1 border"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
        />
        <input
          className="mt-2 p-1 border"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <div className="mt-2 p-1">
          <PhoneInput
            country={"us"}
            value={phone}
            onChange={setPhone}
            inputStyle={{ width: "100%" }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 p-1 border">
          <div>Date of Birth</div>
          <DatePicker onChange={setDob} value={dob} />
        </div>
        <select
          className="mt-2 p-1 border"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="m">Male</option>
          <option value="f">Female</option>
        </select>
      </div>
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() =>
          bookFlight({ firstName, lastName, email, phone, dob, gender })
        }
        disabled={reqState === "loading"}
      >
        Book Flight
      </button>
    </div>
  );
};
