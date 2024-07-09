import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import LoggingIn from "../../components/LoggingIn";

import validators from "../../utils/validators";
import { Context } from "../../store/context";
import { verify_token } from "../../utils/api";

import developersImage from "../../assets/landing/developers.png";
const tirth = "#";
const devanshee = "#";
const citizenModule = "#";

function Home() {
  const setTokenContext = useContext(Context).setToken;
  const tokenContext = useContext(Context).token;
  const setUserContext = useContext(Context).setUser;
  const navigate = useNavigate();
  const [verifing, setVerifing] = useState(true);
  const auth_token = async (token) => {
    const response = await verify_token(token);
    if (response.error) {
      setVerifing(false);
      return;
    } else {
      const { data } = response;
      if (!data.error) {
        setUserContext(data.data);
        navigate("/dashboard");
      }
    }
  };
  useEffect(() => {
    auth_token(tokenContext);
  }, [tokenContext]);
  const setNotificationContext = useContext(Context).setNotification;

  const emailRef = useRef();
  const passwordRef = useRef();
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setLoading] = useState(false);
  const login_user = async () => {
    const password = passwordRef.current.value;
    const email = emailRef.current.value;
    setValidationErrors({});
    if (!password || !validators.password_validator(password))
      return setValidationErrors((err) => ({
        ...err,
        password: "Invalid password format",
      }));
    if (!email || !validators.email_validator(email))
      return setValidationErrors((err) => ({
        ...err,
        email: "Invalid email",
      }));
    else {
      setLoading(true);
      try {
        const response = await axios.post(
          process.env.REACT_APP_REST_API + "/clerk/login-clerk",
          {
            email,
            password,
          }
        );
        const { data } = response;
        setLoading(false);
        if (!data.error) {
          setNotificationContext({
            visible: true,
            color: "green",
            data: data.message,
          });

          setTokenContext(data.data.token);
          setUserContext(data.data.citizen);
          localStorage.setItem("access-token", data.data.token);
          localStorage.setItem("user", JSON.stringify(data.data.clerk));
          navigate("/dashboard");
        } else {
          setNotificationContext({
            visible: true,
            color: "red",
            data: data.message,
          });
        }
      } catch (error) {
        setLoading(false);
        setNotificationContext({
          visible: true,
          color: "red",
          data: error.response
            ? error.response.data.message
            : "Network error !",
        });
      }
    }
  };

  if (verifing) {
    return <LoggingIn />;
  }

  return (
    <main className=" flex flex-col mb-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-r from-neutral-800 to-zinc-500 text-white py-8">
        <h1 className="appear ani-1 font-SFProItalic lg:text-8xl md:text-6xl text-4xl text-center">
          Government Module
        </h1>
        <p className="appear ani-1 lg:text-2xl md:text-xl text-lg text-center mt-4">
          A huge step towards paperless services
        </p>
      </div>
      <div className="flex md:flex-row py-4 px-2  flex-col md:items-stretch items-center w-full  justify-evenly gap-5">
        {/* Login Section */}
        <div className="flex flex-col md:w-1/4 w-full md:items-start items-center p-8 gap-7 ">
          <h1 className="appear font-SFProItalic text-xl font-bold text-blue-500">
            Login with email address
          </h1>
          <div className="flex flex-row md:justify-start justify-center item-start flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              {/* Enter email */}
              <input
                ref={emailRef}
                type="email"
                className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all ${
                  validationErrors.email ? "border-2 border-red-400" : ""
                }`}
                placeholder="Email"
              />
              {validationErrors.email && (
                <p className="appear font-primary font-semibold text-red-400">
                  {validationErrors.email}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {/* Enter password */}
              <input
                ref={passwordRef}
                type="password"
                className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  validationErrors.password ? "border-2 border-red-400" : ""
                }`}
                placeholder="Password"
              />
              {validationErrors.password && (
                <p className="appear font-primary font-semibold text-red-400">
                  {validationErrors.password}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={login_user}
            disabled={isLoading}
            className="appear bg-blue-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-blue-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
          >
            {isLoading ? (
              <div className="flex flex-row gap-3 items-center">
                <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                <p className="font-primary font-medium text-neutral-700">
                  Please wait...
                </p>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </div>
        {/* Developers Section */}
        <div className=" md:w-3/4 w-full p-4  flex lg:flex-row flex-col  justify-evenly gap-10 items-center">
          <div className="appear  h-full flex flex-row lg:gap-10 gap-3 items-center pb-4">
            <img
              className="xs:w-36 w-[40%] xs:h-36 h-[40%]"
              src={developersImage}
              alt="Developers"
            />
            <div className="flex flex-col gap-3">
              <h1 className="sm:text-xl text-base text-neutral-600 whitespace-nowrap font-SFProItalic">
                🧠 Developers
              </h1>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href={tirth}
                    className="sm:text-base text-sm text-blue-500 font-SFProItalic hover:cursor-pointer hover:text-blue-400 transition-all underline underline-offset-2"
                  >
                    Tirth Shah
                  </a>
                </li>
                <li>
                  <a
                    href={devanshee}
                    className="sm:text-base text-sm text-blue-500 font-SFProItalic hover:cursor-pointer hover:text-blue-400 transition-all underline underline-offset-2"
                  >
                    Devanshee Ramanuj
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div
            id="modules"
            className="appear h-full pb-4 flex flex-col justify-center lg:gap-10 gap-3 items-center"
          >
            <h1 className="text-xl text-neutral-600  font-SFProItalic">
              🔗 Link to modules
            </h1>
            <ul>
              <li>
                <a
                  href={citizenModule}
                  className="text-base  text-blue-500 font-SFProItalic hover:cursor-pointer hover:text-blue-400 transition-all underline underline-offset-2"
                >
                  Citizen module
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
