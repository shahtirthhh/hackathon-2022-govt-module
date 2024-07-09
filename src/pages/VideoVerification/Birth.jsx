import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../store/context";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Birth = ({ application }) => {
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
        <div className="flex flex-row flex-wrap gap-4">
          {/* Child Details  */}
          <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
            <h1 className="font-SFProItalic text-xl text-neutral-500">
              {`${allData.form_data.childFirstName} ${allData.form_data.childMiddleName} ${allData.form_data.childLastName}`}
            </h1>
            <div className="flex flex-row flex-wrap gap-3">
              <p className="bg-primary rounded-md px-2 py-1  font-primary font-medium text-neutral-600">
                D.O.B: {allData.form_data.childBirthDate}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.childGender}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.placeOfBirth}
              </p>
            </div>
          </div>
          {/* Mother Details  */}
          <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
            <div className="flex flex-row items-center flex-wrap gap-3">
              <img
                src={allData.mother.photo}
                alt="mother"
                className="w-20 h-20 rounded-full"
              />
              <h1 className="font-SFProItalic text-xl text-neutral-500">
                {`${allData.mother.firstName} ${allData.mother.middleName} ${allData.mother.lastName}`}
              </h1>
            </div>
            <div className="flex flex-row flex-wrap gap-3">
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                Mother
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                Age at birth: {allData.form_data.motherAgeAtBirth}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.motherLiteracy}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.motherReligion}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.motherOccupation}
              </p>
            </div>
          </div>
          {/* Father Details  */}
          <div className="w-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
            <div className="flex flex-row items-center flex-wrap gap-3">
              <img
                src={allData.father.photo}
                alt="father"
                className="w-20 h-20 rounded-full"
              />
              <h1 className="font-SFProItalic text-xl text-neutral-500">
                {`${allData.father.firstName} ${allData.father.middleName} ${allData.father.lastName}`}
              </h1>
            </div>
            <div className="flex flex-row flex-wrap gap-3">
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                Father
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.fatherLiteracy}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.fatherReligion}
              </p>
              <p className="bg-primary rounded-md px-2 py-1 font-primary font-medium text-neutral-600">
                {allData.form_data.fatherOccupation}
              </p>
            </div>
          </div>
          {/* Citizen Details  */}
          {allData.mother.id === allData.citizen.id ? (
            <div className="w-fit h-fit flex flex-col rounded-lg p-3 shadow-md gap-3 bg-white">
              <h1 className="rounded-lg p-3 shadow-md  bg-white font-SFProItalic text-xl text-neutral-500">
                Application by: Mother
              </h1>
            </div>
          ) : allData.father.id === allData.citizen.id ? (
            <h1 className="w-fit h-fit rounded-lg p-3 shadow-md  bg-white font-SFProItalic text-xl text-neutral-500">
              Application by: Father
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
        <div className="flex flex-row flex-wrap gap-4">
          <div className="w-fit flex flex-col p-3 gap-3">
            <h1 className="font-SFProItalic text-xl text-neutral-500">
              Permanent address proof
            </h1>
            <img
              className="w-96 h-96 border border-black rounded-lg"
              src={allData.form_data.permanentAddProofDOC}
              alt="addProof"
            />
          </div>
          <div className="w-fit flex flex-col p-3 gap-3">
            <h1 className="font-SFProItalic text-xl text-neutral-500">
              Proof of birth
            </h1>
            <img
              className="w-96 h-96 border border-black rounded-lg"
              src={allData.form_data.proofOfBirthDOC}
              alt="birthProof"
            />
          </div>
          <div className="w-fit flex flex-col p-3 gap-3">
            <h1 className="font-SFProItalic text-xl text-neutral-500">
              Marriage certificate
            </h1>
            <img
              className="w-96 h-96 border border-black rounded-lg"
              src={allData.form_data.marriageCertificateDOC}
              alt="marriageCerti"
            />
          </div>
        </div>
      </div>
    );
};

export default Birth;
