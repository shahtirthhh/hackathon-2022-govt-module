import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../store/context";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Marriage = ({ application }) => {
  const [loading, setLoading] = useState(true);

  const tokenContext = useContext(Context).token;
  const [allData, setAllData] = useState(undefined);
  const navigate = useNavigate();
  const get_data_for_verification = async () => {
    if (!tokenContext) return navigate("/dashboard");
    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/clerk/get-submitted-form",
        {
          application,
        },
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );
      const { data } = response;
      if (!data.error) {
        setAllData(data.data.all_data);
        setLoading(false);
      } else {
        setLoading("error");
      }
    } catch (error) {
      setLoading("error");
    }
  };
  console.log(allData);
  useEffect(() => {
    get_data_for_verification();
  }, []);
  if (loading)
    return (
      <div className="appear flex gap-3 items-center justify-center">
        <div className="spinner border-[3px] border-blue-400 w-3 h-3"></div>
        <p className="font-SFProItalic text-neutral-600">
          Getting submitted form by the citizen
        </p>
      </div>
    );
  if (loading === "error")
    return (
      <div className="appear flex gap-3 items-center justify-center">
        <p className="font-SFProItalic text-red-500">Error occured !</p>
      </div>
    );
  if (allData)
    return (
      <div className="w-full flex flex-col p-3 gap-4">
        {/* Marriage Details  */}
        <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white h-fit">
          <div className="flex flex-row flex-wrap gap-3">
            <p className="bg-primary rounded-md px-2 py-1  font-primary font-medium text-neutral-600">
              Place: {allData.form_data.placeOfMarriage}
            </p>
            <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
              Date: {allData.form_data.dateOfMarriage}
            </p>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-4">
          {/* Groom Details  */}
          <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
            <div className="flex flex-row items-center flex-wrap gap-3">
              <img
                src={allData.groom.photo}
                alt="groom"
                className="w-20 h-20 rounded-full"
              />
              <h1 className="font-SFProItalic text-xl text-neutral-500">
                {`${allData.groom.firstName} ${allData.groom.middleName} ${allData.groom.lastName}`}
              </h1>
            </div>
            <div className="flex flex-row flex-wrap gap-3">
              <p className="h-fit bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                Groom
              </p>
              <p className="h-fit bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                D.O.B: {allData.form_data.groomDOB}
              </p>
              <p className="h-fit bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.groomOccupation}
              </p>
              <p className="h-fit bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.groomReligion}
              </p>
            </div>
            <img
              src={allData.form_data.groomSignature}
              alt="groom"
              className="w-40  h-32 shadow-md rounded-lg"
            />
          </div>
          {/* Bride Details  */}
          <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
            <div className="flex flex-row items-center flex-wrap gap-3">
              <img
                src={allData.bride.photo}
                alt="bride"
                className="w-20 h-20 rounded-full"
              />
              <h1 className="font-SFProItalic text-xl text-neutral-500">
                {`${allData.bride.firstName} ${allData.bride.middleName} ${allData.bride.lastName}`}
              </h1>
            </div>
            <div className="flex flex-row flex-wrap gap-3">
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                Bride
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                D.O.B: {allData.form_data.brideDOB}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.brideOccupation}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.brideReligion}
              </p>
            </div>
            <img
              src={allData.form_data.brideSignature}
              alt="bride"
              className="w-40 shadow-md h-32 rounded-lg"
            />
          </div>
          {/* Citizen Details  */}
          {allData.groom.id === allData.citizen.id ? (
            <div className="w-fit h-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
              <h1 className="rounded-lg p-3  bg-white font-SFProItalic text-xl text-neutral-500">
                Application by: Groom
              </h1>
            </div>
          ) : allData.bride.id === allData.citizen.id ? (
            <h1 className="w-fit h-fit rounded-lg p-3   bg-white font-SFProItalic text-xl text-neutral-500">
              Application by: Bride
            </h1>
          ) : (
            <div className="w-fit h-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
              <h1 className="font-SFProItalic text-xl text-neutral-500">
                Application by:
              </h1>
              <div className="flex flex-row items-center flex-wrap gap-3">
                <img
                  src={allData.citizen.photo}
                  alt="citizen"
                  className="w-20 h-20 rounded-full"
                />
                <h1 className="font-SFProItalic text-xl text-neutral-500">
                  {`${allData.citizen.firstName} ${allData.citizen.middleName} ${allData.citizen.lastName}`}
                </h1>
              </div>
              <div className="flex flex-row flex-wrap gap-3">
                <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                  {allData.citizen.addressLine}, {allData.citizen.district}
                </p>
                <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                  {allData.citizen.email}
                </p>
                <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                  {allData.citizen.mobile}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Witness Details  */}
        <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
          <div className="flex flex-row flex-wrap gap-3">
            <img
              src={allData.form_data.witnessID}
              alt="bride"
              className="w-60  h-44 rounded-lg"
            />
            <img
              src={allData.form_data.witnessSignature}
              alt="bride"
              className="w-40  h-36 rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-4">
          <div className="w-fit flex flex-col p-3 gap-3">
            <h1 className="font-SFProItalic text-xl text-neutral-500">
              Priest's signature
            </h1>
            <img
              src={allData.form_data.priestSignature}
              alt="ps"
              className="w-40  h-36 rounded-lg"
            />
          </div>
          <div className="w-fit flex flex-col p-3 gap-3">
            <h1 className="font-SFProItalic text-xl text-neutral-500">
              Marriage photo
            </h1>
            <img
              className="w-96 h-96  rounded-lg"
              src={allData.form_data.marriagePhoto1}
              alt="marriagePhoto1"
            />
          </div>
          <div className="w-fit flex flex-col p-3 gap-3">
            <h1 className="font-SFProItalic text-xl text-neutral-500">
              Another marriage photo
            </h1>
            <img
              className="w-96 h-96  rounded-lg"
              src={allData.form_data.marriagePhoto2}
              alt="marriagePhoto2"
            />
          </div>
        </div>
      </div>
    );
};

export default Marriage;
