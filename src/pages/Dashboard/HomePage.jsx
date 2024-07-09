import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { Context } from "../../store/context";
import { verify_token } from "../../utils/api";

import Navbar from "../../components/Navbar";
import MobileNavbar from "../../components/MobileNavbar";
import Authenticating from "../../components/Authenticating";
import InputModal from "../../components/InputModal";

const HomePage = () => {
  const tokenContext = useContext(Context).token;
  const setUserContext = useContext(Context).setUser;

  const navigate = useNavigate();
  const [verifing, setVerifing] = useState(true);
  const auth_token = async (token) => {
    const response = await verify_token(token);
    if (response.error) {
      setVerifing(false);
      navigate("/");
      return;
    } else {
      const { data } = response;
      if (!data.error) {
        localStorage.setItem("user", JSON.stringify(data.data));
        setUserContext(data.data);
        setVerifing(false);
      }
    }
  };
  useEffect(() => {
    auth_token(tokenContext);
  }, [tokenContext]);

  const userContext = useContext(Context).user;
  const socketContext = useContext(Context).socket;
  const setNotificationContext = useContext(Context).setNotification;
  const setModalContext = useContext(Context).setModal;

  const [loading, setLoading] = useState(false);
  const [todaysApplications, setTodaysApplications] = useState(undefined);
  const [currentId, setCurrentId] = useState(null);

  const [status, setStatus] = useState("offline");
  const [statusChanging, setStatusChanging] = useState(false);

  const [inputModal, setInputModal] = useState({
    isOpen: false,
    type: "delete",
    title: "Reject application ?",
    confirmText: "Reject",
    cancelText: "Cancel",
  });

  const citizensQueueContext = useContext(Context).citizens_queue;
  const handleCardClick = (id) => {
    setCurrentId(currentId === id ? null : id);
  };

  const get_todays_applications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.REACT_APP_REST_API + "/clerk/get-todays-applications",
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );

      const { data } = response;
      if (!data.error) {
        setLoading(false);

        const applications = data.data.todays_applications;
        const modified_applications = [];

        applications.map((application) => {
          const new_application = {};
          new_application.holders = [];
          Object.keys(application).map((key) => {
            if (
              (key === "holder1" || key === "holder2" || key === "holder3") &&
              application[key] !== null
            ) {
              new_application.holders.push(application[key]);
            } else {
              new_application[key] = application[key];
            }
          });
          modified_applications.push(new_application);
        });
        setTodaysApplications(modified_applications);
      } else {
        setNotificationContext({
          visible: true,
          color: "red",
          data: data.message,
        });
        setLoading("error");
      }
    } catch (error) {
      setLoading(false);
      setLoading("error");
      setNotificationContext({
        visible: true,
        color: "red",
        data: error.response ? error.response.data.message : "Network error !",
      });
    }
  };
  const update_status = async (change_to) => {
    setStatusChanging(true);
    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/clerk/change-online-status",
        {
          change_to,
          socket_id: socketContext.id,
        },
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );

      const { data } = response;
      if (!data.error) {
        setStatus(change_to);
        setStatusChanging(false);
      } else {
        setStatusChanging(false);
        setNotificationContext({
          visible: true,
          color: "red",
          data: data.message,
        });
      }
    } catch (error) {
      setStatusChanging(false);
      setNotificationContext({
        visible: true,
        color: "red",
        data: error.response ? error.response.data.message : "Network error !",
      });
    }
  };

  const start_verification_confirm = (application) => {
    setModalContext({
      isOpen: false,
    });
    localStorage.setItem("application-to-verify", JSON.stringify(application));
    navigate("/dashboard/video-verification");
  };
  const start_verification_cancel = () => {
    setModalContext({
      isOpen: false,
    });
  };

  const issue_certificate_confirm = async (application) => {
    setModalContext({
      title: "Issue certificate",
      type: "loading",
      message: "Processing certificate...",
      confirmText: "Please wait...",
      isOpen: true,
    });
    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/clerk/issue-certificate",
        {
          application,
          form_type: application.form_type,
        },
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );

      const { data } = response;
      if (!data.error) {
        setModalContext({
          isOpen: false,
        });
        setNotificationContext({
          visible: true,
          color: "green",
          data: data.message,
        });
        get_todays_applications();
      } else {
        setNotificationContext({
          visible: true,
          color: "red",
          data: data.message,
        });
        setModalContext({
          isOpen: false,
        });
      }
    } catch (error) {
      setModalContext({
        isOpen: false,
      });
      setNotificationContext({
        visible: true,
        color: "red",
        data: error.response ? error.response.data.message : "Network error !",
      });
    }
  };
  const issue_certificate_cancel = async () => {
    setModalContext({
      isOpen: false,
    });
  };

  const reject_application_confirm = async (application, reason) => {
    setInputModal((prev) => ({
      ...prev,
      isOpen: true,
      type: "loading",
      confirmText: "Rejecting...",
    }));
    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/clerk/reject-application",
        {
          application,
          form_type: application.form_type,
          reason,
        },
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );

      const { data } = response;
      if (!data.error) {
        setInputModal({ isOpen: false, type: "delete" });
        setNotificationContext({
          visible: true,
          color: "green",
          data: data.message,
        });
        get_todays_applications();
      } else {
        setNotificationContext({
          visible: true,
          color: "red",
          data: data.message,
        });
        setInputModal({ isOpen: false, type: "delete" });
      }
    } catch (error) {
      setInputModal({ isOpen: false, type: "delete" });
      setNotificationContext({
        visible: true,
        color: "red",
        data: error.response ? error.response.data.message : "Network error !",
      });
    }
  };
  const reject_application_cancel = async () => {
    setInputModal({ isOpen: false, type: "delete" });
  };

  useEffect(() => {
    if (!verifing) {
      get_todays_applications();
      update_status("offline");
    }
  }, [verifing]);

  useEffect(() => {
    const requestTimeMap = new Map();
    citizensQueueContext.forEach((entry) => {
      requestTimeMap.set(entry.application_id, entry.requested_at);
    });
    todaysApplications?.sort((a, b) => {
      const requestedAtA = requestTimeMap.get(a.application_id);
      const requestedAtB = requestTimeMap.get(b.application_id);

      if (!requestedAtA || !requestedAtB) {
        return 0;
      }

      return requestedAtA - requestedAtB;
    });
    setTodaysApplications(todaysApplications);
  }, [citizensQueueContext, todaysApplications]);

  if (verifing) {
    return <Authenticating />;
  }
  return (
    <main className="flex flex-col mb-16">
      {/* Hero Section */}
      <div className="sticky z-[49] top-0 flex flex-col">
        <div className="flex md:flex-row flex-col md:gap-4 gap-8 p-4  items-left justify-between bg-gradient-to-r from-neutral-800 to-zinc-500 text-white ">
          <div className="flex flex-col gap-4">
            <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
              Dashboard
            </h1>
            <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
              Good day! {userContext.fullName}
            </p>
          </div>
          <Navbar />
        </div>
        <MobileNavbar />
      </div>
      <div className="w-full flex flex-row justify-between p-4 pt-5">
        <div className="flex flex-col gap-2">
          <p className="appear font-SFProItalic text-neutral-600 lg:text-lg md:text-sm text-xs">
            {userContext.district}
          </p>
          {userContext && (
            <p className="appear font-SFProItalic text-neutral-600 lg:text-lg md:text-sm text-xs">
              {userContext.department[0] +
                userContext.department.slice(1).toLowerCase() +
                " department"}
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {socketContext?.connected && (
            <button
              onClick={() => {
                if (status === "offline") {
                  update_status("online");
                } else {
                  update_status("offline");
                }
              }}
              disabled={statusChanging}
              className={`appear disabled:bg-neutral-500 rounded-lg shadow-md px-4 py-2 font-primary md:text-sm text-xs font-semibold text-white transition-all ${
                status === "offline"
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-red-600 hover:bg-red-500"
              }`}
            >
              {statusChanging ? (
                <div className="appear flex gap-1 items-center justify-end w-full">
                  <div className="spinner border-2 border-white w-[0.6rem] h-[0.6rem]"></div>
                  <p className="font-primary sm:text-sm text-xs font-semibold text-white ">
                    {status === "offline" ? "Starting.." : "Stopping.."}
                  </p>
                </div>
              ) : status === "offline" ? (
                "Start verification"
              ) : (
                "Stop verification"
              )}
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:p-4 sm:py-10 py-20 px-4 sm:gap-20 gap-16 items-center">
        {todaysApplications && todaysApplications.length > 0 && (
          <p className="appear font-SFProItalic sm:text-xl text-lg font-semibold text-neutral-700 w-full text-center">
            Today's applications
          </p>
        )}

        {!todaysApplications && (
          <div className="w-fullh-full justify-center items-center">
            {loading && loading !== "error" && (
              <div className="flex flex-row gap-3 justify-center items-center w-full my-40 ">
                <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                <p className="font-primary font-medium text-neutral-700">
                  Getting today's applications...
                </p>
              </div>
            )}
            {loading === "error" && (
              <div className="flex flex-row gap-3 items-center justify-center my-40 w-full">
                <p className="font-SFProItalic text-xl font-medium text-red-400">
                  Error getting applications !!
                </p>
              </div>
            )}
          </div>
        )}
        {todaysApplications && todaysApplications.length < 1 && (
          <div className="flex flex-row gap-3 items-center justify-center my-40 w-full">
            <p className="font-SFProItalic text-xl font-medium text-neutral-600">
              No current applications found !
            </p>
          </div>
        )}
        {todaysApplications && todaysApplications.length > 0 && (
          <div className="flex flex-col items-center justify-start  my-10 w-full ">
            <div className="hidden sm:flex justify-center ">
              <table className="font-primary overflow-auto w-full">
                <thead className="appaer bg-neutral-200 rounded-lg">
                  <tr>
                    <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                      Date
                    </th>
                    <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                      Holders
                    </th>
                    <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                      Slot
                    </th>
                    <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                      Join status
                    </th>
                    <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                      Issue status
                    </th>
                    <th className="font-SFProItalic text-neutral-700 text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                      Rejection status
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  {todaysApplications.map((application) => {
                    let joinStatus = "-",
                      issued = "-",
                      reason = "-",
                      slot = "-";
                    if (
                      application.joined_online &&
                      !application.issued &&
                      !application.rejection_reason
                    ) {
                      joinStatus = (
                        <span className="text-green-500 font-semibold">
                          Joined
                        </span>
                      );
                      issued = (
                        <button
                          onClick={() => {
                            setModalContext({
                              title: "Issue certificate ?",
                              type: "confirm",
                              message:
                                "Certificate will be generated for this application",
                              confirmText: "Issue",
                              cancelText: "Cancel",
                              onConfirm: () =>
                                issue_certificate_confirm(application),
                              onCancel: issue_certificate_cancel,
                              isOpen: true,
                            });
                          }}
                          className="text-green-500 hover:text-green-600 underline underline-offset-2 transition-all"
                        >
                          Issue
                        </button>
                      );
                      reason = (
                        <button
                          onClick={() =>
                            setInputModal({
                              isOpen: true,
                              type: "delete",
                              title: "Reject application ?",
                              confirmText: "Reject",
                              cancelText: "Cancel",
                              onConfirm: (reason) =>
                                reject_application_confirm(application, reason),
                              onCancel: reject_application_cancel,
                            })
                          }
                          className="text-red-500 hover:text-red-600 underline underline-offset-2 transition-all"
                        >
                          Reject
                        </button>
                      );
                    } else if (
                      application.joined_online &&
                      application.issued
                    ) {
                      issued = (
                        <span className="text-green-500 font-semibold">
                          Issued
                        </span>
                      );
                    } else if (
                      application.joined_online &&
                      application.rejection_reason
                    ) {
                      reason = (
                        <span className="text-red-500 font-semibold">
                          {application.rejection_reason}
                        </span>
                      );
                    } else if (
                      application.joined_online === false &&
                      application.rejection_reason
                    ) {
                      joinStatus = (
                        <span className="text-red-500 font-semibold">
                          Slot missed
                        </span>
                      );
                    } else {
                      joinStatus = (
                        <span className="text-blue-500 font-semibold">
                          Pending
                        </span>
                      );
                    }
                    slot = slot = `${
                      new Date(application.slot.start).toLocaleDateString() +
                      "\n" +
                      new Date(application.slot.start)
                        .toTimeString()
                        .split(" ")[0]
                        .slice(0, 5) +
                      "-" +
                      new Date(application.slot.end)
                        .toTimeString()
                        .split(" ")[0]
                        .slice(0, 5)
                    } `;
                    return (
                      <tr
                        className="appear mt-4  border-b-[1px] border-neutral-300"
                        key={application.application_id}
                      >
                        <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </td>
                        <td className="flex flex-col justify-center px-2 md:text-sm text-xs py-4  ">
                          {application.holders.map((holder, index) =>
                            holder ? (
                              <span key={index}>
                                {application.holders.length > 1 ? `-` : ""}{" "}
                                {holder}
                              </span>
                            ) : (
                              <></>
                            )
                          )}
                        </td>

                        <td className=" px-2 md:text-sm text-xs py-4 border-2 whitespace-pre-line">
                          {slot}
                        </td>

                        <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                          {citizensQueueContext.findIndex(
                            (c) =>
                              c.application_id === application.application_id
                          ) === -1 ? (
                            joinStatus
                          ) : (
                            <button
                              onClick={() => {
                                setModalContext({
                                  title: "Start verification ?",
                                  type: "confirm",
                                  message:
                                    "Citizen will be connected once started !",
                                  confirmText: "Start",
                                  cancelText: "Cancel",
                                  onConfirm: () =>
                                    start_verification_confirm(application),
                                  onCancel: start_verification_cancel,
                                  isOpen: true,
                                });
                              }}
                              className="px-2 py-1 bg-green-400 hover:bg-green-500 transition-all  rounded-md shadow-md"
                            >
                              Start
                            </button>
                          )}
                        </td>
                        <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                          {issued}
                        </td>
                        <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                          {reason}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex sm:hidden flex-col gap-4 w-full px-5">
              {todaysApplications.map((application) => {
                let joinStatus = "-",
                  issued = "-",
                  reason = "-",
                  slot = "-";
                if (
                  application.joined_online &&
                  !application.issued &&
                  !application.rejection_reason
                ) {
                  joinStatus = (
                    <span className="text-green-500 font-semibold">Joined</span>
                  );
                  issued = (
                    <button
                      onClick={() => {
                        setModalContext({
                          title: "Issue certificate ?",
                          type: "confirm",
                          message:
                            "Certificate will be generated for this application",
                          confirmText: "Issue",
                          cancelText: "Cancel",
                          onConfirm: () =>
                            issue_certificate_confirm(application),
                          onCancel: issue_certificate_cancel,
                          isOpen: true,
                        });
                      }}
                      className="text-green-500 hover:text-green-600 underline underline-offset-2 transition-all"
                    >
                      Issue
                    </button>
                  );
                  reason = (
                    <button
                      onClick={() =>
                        setInputModal({
                          isOpen: true,
                          type: "delete",
                          title: "Reject application ?",
                          confirmText: "Reject",
                          cancelText: "Cancel",
                          onConfirm: (reason) =>
                            reject_application_confirm(application, reason),
                          onCancel: reject_application_cancel,
                        })
                      }
                      className="text-red-500 hover:text-red-600 underline underline-offset-2 transition-all"
                    >
                      Reject
                    </button>
                  );
                } else if (application.joined_online && application.issued) {
                  issued = (
                    <span className="text-green-500 font-semibold">Issued</span>
                  );
                } else if (
                  application.joined_online &&
                  application.rejection_reason
                ) {
                  reason = (
                    <span className="text-red-500 font-semibold">
                      {application.rejection_reason}
                    </span>
                  );
                } else if (
                  application.joined_online === false &&
                  application.rejection_reason
                ) {
                  joinStatus = (
                    <span className="text-red-500 font-semibold">
                      Slot missed
                    </span>
                  );
                } else {
                  joinStatus = (
                    <span className="text-blue-500 font-semibold">Pending</span>
                  );
                }
                slot = slot = `${
                  new Date(application.slot.start).toLocaleDateString() +
                  "\n" +
                  new Date(application.slot.start)
                    .toTimeString()
                    .split(" ")[0]
                    .slice(0, 5) +
                  "-" +
                  new Date(application.slot.end)
                    .toTimeString()
                    .split(" ")[0]
                    .slice(0, 5)
                } `;

                const isExpanded = currentId === application.application_id;

                return (
                  <>
                    <div
                      key={application.application_id}
                      className={`appear flex justify-between items-center bg-white p-3 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all hover:bg-slate-100 w-full ${
                        slot === <Link /> ? "bg-emerald-200" : ""
                      }`}
                      onClick={() =>
                        handleCardClick(application.application_id)
                      }
                    >
                      <span className="w-[20%] text-xs font-primary font-semibold text-neutral-600 text-left">
                        {application.form_type}
                      </span>
                      <div className="flex flex-col w-auto">
                        <span className="text-[0.6rem] font-primary font-medium text-neutral-600 text-center">
                          Submitted on
                        </span>{" "}
                        <span className=" text-xs font-primary font-medium text-neutral-600 text-center">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="w-[40%] text-[0.7rem] font-primary font-medium text-right">
                        {application.holders[0]}
                      </span>
                    </div>
                    {isExpanded && (
                      <table className="appear rounded-lg bg-white">
                        <thead className="rounded-lg bg-gray-100">
                          <tr>
                            <th className="border-2  font-SFProRegular text-neutral-600 whitespace-nowrap text-[0.6rem]  text-center px-1">
                              Department
                            </th>
                            <th className="border-2  font-SFProRegular text-neutral-600 whitespace-nowrap text-[0.6rem]  text-center px-1">
                              Slot
                            </th>
                            <th className="border-2  font-SFProRegular text-neutral-600 whitespace-nowrap text-[0.6rem]  text-center px-1">
                              Joining status
                            </th>
                            <th className="border-2  font-SFProRegular text-neutral-600 whitespace-nowrap text-[0.6rem]  text-center px-1">
                              Issued
                            </th>
                            <th className="border-2  font-SFProRegular text-neutral-600 text-[0.6rem]  text-center px-1">
                              Rejection reason
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            className="mt-4  border-b-[1px] border-neutral-300"
                            key={application.application_id}
                          >
                            <td className=" px-1 text-[0.7rem] py-2 border-2 ">
                              {application.district}
                            </td>
                            <td className=" px-1 text-[0.7rem] py-2 border-2 whitespace-pre-line">
                              {slot}
                            </td>
                            <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                              {citizensQueueContext.findIndex(
                                (c) =>
                                  c.application_id ===
                                  application.application_id
                              ) === -1 ? (
                                joinStatus
                              ) : (
                                <button
                                  onClick={() => {
                                    setModalContext({
                                      title: "Start verification ?",
                                      type: "confirm",
                                      message:
                                        "Citizen will be connected once started !",
                                      confirmText: "Start",
                                      cancelText: "Cancel",
                                      onConfirm: () =>
                                        start_verification_confirm(application),
                                      onCancel: start_verification_cancel,
                                      isOpen: true,
                                    });
                                  }}
                                  className="px-2 py-1 bg-green-400 hover:bg-green-500 transition-all  rounded-md shadow-md"
                                >
                                  Start
                                </button>
                              )}
                            </td>
                            <td className=" px-1 text-[0.7rem] py-2 border-2 ">
                              {issued}
                            </td>
                            <td className=" px-1 text-[0.7rem] py-2 border-2 ">
                              {reason}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <InputModal
        isOpen={inputModal.isOpen}
        confirmText={inputModal.confirmText}
        cancelText={inputModal.cancelText}
        title={inputModal.title}
        type={inputModal.type}
        onConfirm={inputModal.onConfirm}
        onCancel={inputModal.onCancel}
      />
    </main>
  );
};

export default HomePage;
