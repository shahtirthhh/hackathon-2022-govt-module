import { useRef, useState } from "react";

const InputModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  type,
  cancelText,
  confirmText,
}) => {
  const reasonRef = useRef();
  const [errors, setErrors] = useState({});
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="appear bg-[#e2e2e2] shadow-xl rounded-lg p-6 w-full max-w-md flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold font-SFProItalic text-2xl text-neutral-700">
            {title}
          </h2>
          <div className="flex flex-col gap-2">
            <input
              ref={reasonRef}
              type="text"
              disabled={type === "loading"}
              className={`w-[80%] appear disabled:bg-gray-400 p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                errors.reason ? "border-2 border-red-400" : ""
              }`}
              placeholder="Rejection reason"
            />
            {errors.reason && (
              <p className="font-primary text-xs font-semibold text-red-400">
                {errors.reason}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          {type !== "loading" && (
            <button
              onClick={() => {
                setErrors({});
                onCancel();
              }}
              className="font-primary px-4 py-2 bg-gray-400 text-gray-800 rounded hover:bg-gray-500 transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            disabled={type === "loading"}
            onClick={() => {
              const r = reasonRef.current.value;
              if (!r || r.trim().length < 8)
                return setErrors({
                  reason: "Rejection reason must be long enough !",
                });
              onConfirm(r);
            }}
            className={`disabled:cursor-not-allowed flex flex-row gap-2 items-center font-primary px-4 py-2 transition-all ${
              type === "delete"
                ? "bg-red-600 text-white  hover:bg-red-700"
                : type === "loading"
                ? "disabled:bg-neutral-500 text-white "
                : "bg-green-500 text-white hover:bg-emerald-700"
            } rounded`}
          >
            {type === "loading" ? (
              <>
                <div className="flex flex-row gap-3 items-center">
                  <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                  <p className="font-primary font-medium text-neutral-700">
                    {confirmText}
                  </p>
                </div>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
