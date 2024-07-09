import React, { useState } from "react";

export const Context = React.createContext({
  socket: null,
  setSocket: (socket) => {},

  notification: { color: null, data: null },
  setNotification: ({ visible, color, data, loading = false }) => {},

  modal: {
    title: "",
    type: "loading",
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
    onCancel: () => {},
    isOpen: false,
  },
  setModal: (
    title,
    type,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    isOpen
  ) => {},

  token: "",
  setToken: (token) => {},

  user: {},
  setUser: (user) => {},

  citizens_queue: [],
  add_to_queue: ({ citizen_id, application_id, citizen_socket }) => {},
  remove_from_queue: (citizen_socket) => {},
});
// eslint-disable-next-line
export default (props) => {
  const [socketValue, setSocketValue] = useState(null);

  const [notificationValue, setNotificationValue] = useState({
    color: "null",
    data: "null",
    visible: false,
    loading: false,
  });
  const [modalValue, setModalValue] = useState({
    title: "",
    type: "loading",
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
    onCancel: () => {},
    isOpen: false,
  });
  const storedToken = localStorage.getItem("access-token");
  const [tokenValue, setTokenValue] = useState(storedToken || "");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [userValue, setUserValue] = useState(storedUser || undefined);

  const [citizensQueueValue, setCitizensQueueValue] = useState([]);

  const remove_from_queue = (citizen_socket) => {
    setCitizensQueueValue((prev) => {
      return prev.filter(
        (queueItem) => queueItem.citizen_socket !== citizen_socket
      );
    });
  };
  const add_to_queue = ({ citizen_id, application_id, citizen_socket }) => {
    setCitizensQueueValue((prev) => {
      const found = prev.findIndex(
        (queueItem) =>
          queueItem.citizen_id === citizen_id &&
          queueItem.application_id === application_id
      );
      if (found !== -1) {
        prev[found].citizen_socket = citizen_socket;
        prev[found].requested_at = new Date();
        return prev;
      } else {
        return [
          ...prev,
          {
            citizen_id,
            application_id,
            citizen_socket,
            requested_at: new Date(),
          },
        ];
      }
    });
  };

  return (
    <Context.Provider
      value={{
        socket: socketValue,
        notification: notificationValue,

        setSocket: setSocketValue,
        setNotification: setNotificationValue,

        modal: modalValue,
        setModal: setModalValue,

        token: tokenValue,
        setToken: setTokenValue,

        user: userValue,
        setUser: setUserValue,

        citizens_queue: citizensQueueValue,
        add_to_queue,
        remove_from_queue,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};
