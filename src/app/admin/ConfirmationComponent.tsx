export default function ConfirmationComponent({confirmation, setConfirmation, message = "Are you sure? This action is not reversible!"}: {
  confirmation: (() => void) | null,
  setConfirmation: (confirmation: (() => void) | null)=> void,
  message?: string
}) {
  return (
    <>
    {
      confirmation ?
      <div className="fixed left-0 top-0 w-full h-full bg-neutral-950/50 flex justify-center items-center">
        <div className="absolute border-solid border-white border bg-black rounded-lg p-2 text-center">
          <p className="mb-3">{message}</p>
          <div className="flex">
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2 mr-2" value="Confirm" onClick={() => {
              confirmation();
              setConfirmation(null);
            }} />
            <input type="button" className="border-solid border-white border-2 rounded-lg p-2" onClick={() => {
              setConfirmation(null);
            }} value="Cancel" />
          </div>
        </div>
      </div>
      :
      ""
    }
    </>
  );
}