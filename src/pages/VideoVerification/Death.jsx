import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../store/context";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Death = ({ application }) => {
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
        <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
          <div className="flex flex-row flex-wrap gap-3">
            <p className="bg-primary rounded-md px-2 py-1  font-primary font-medium text-neutral-600">
              Date: {allData.form_data.dateOfDeath}
            </p>
            <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
              {allData.form_data.placeOfDeath}
            </p>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-4">
          {/* Death Details  */}
          {/* Deceased Details  */}
          <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
            <div className="flex flex-row items-center flex-wrap gap-3">
              <img
                src={allData.deceased.photo}
                alt="mother"
                className="w-20 h-20 rounded-full"
              />
              <h1 className="font-SFProItalic text-xl text-neutral-500">
                {`${allData.deceased.firstName} ${allData.deceased.middleName} ${allData.deceased.lastName}`}
              </h1>
            </div>
            <div className="flex flex-row flex-wrap gap-3">
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                Deceased
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.deathReason}
              </p>
            </div>
          </div>
          {/* Filler Details  */}
          <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
            <div className="flex flex-row items-center flex-wrap gap-3">
              <img
                src={allData.filler.photo}
                alt="filler"
                className="w-20 h-20 rounded-full"
              />
              <h1 className="font-SFProItalic text-xl text-neutral-500">
                {`${allData.filler.firstName} ${allData.filler.middleName} ${allData.filler.lastName}`}
              </h1>
            </div>
            <div className="flex flex-row flex-wrap gap-3">
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                Filler
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.fillerRelation}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.filler.addressLine}, {allData.filler.district}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.filler.email}
              </p>
            </div>
          </div>
          {/* Citizen Details  */}
          {allData.filler.id === allData.citizen.id ? (
            <div className="w-fit h-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
              <h1 className="rounded-lg p-3   bg-white font-SFProItalic text-xl text-neutral-500">
                Application by: Filler
              </h1>
            </div>
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
        <div className="flex flex-row flex-wrap gap-4">
          <div className="w-fit flex flex-col p-3 gap-3">
            <h1 className="font-SFProItalic text-xl text-neutral-500">
              Crematorium declaration
            </h1>
            <img
              className="w-96 h-96  rounded-lg"
              src={allData.form_data.crematoriumDeclaration}
              alt="addProof"
            />
          </div>
          <div className="w-fit flex flex-col p-3 gap-3">
            <h1 className="font-SFProItalic text-xl text-neutral-500">
              Hospital declaration
            </h1>
            <img
              className="w-96 h-96  rounded-lg"
              src={allData.form_data.hospitalDeclaration}
              alt="birthProof"
            />
          </div>
        </div>
      </div>
    );
};

export default Death;
