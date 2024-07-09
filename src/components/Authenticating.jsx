const Authenticating = () => {
  return (
    <main className="flex flex-col mb-16 h-full">
      {/* Hero Section */}
      <div className="flex sm:flex-row flex-col gap-4 p-4 items-left justify-between bg-gradient-to-r from-neutral-800 to-zinc-500 text-white py-8">
        <div className="flex flex-col gap-4">
          <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
            Authenticating...
          </h1>
          <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
            Secure system, secure citizens !
          </p>
        </div>
      </div>
    </main>
  );
};

export default Authenticating;
