import { Container } from "@/Components/Dashboard";
import { DashboardLayout } from "@/Layouts";
import { addCodeSchema, sendMessageSchema } from "@/Schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAdminStore } from "@/Stores";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { UserDetails } from "@/Components/Admin";
import { useUser } from "@/Hooks";

const Codes = () => {
  const { id } = useParams();

  const {
    addCode,
    sendMessage,
    isAddingCode,
    isSendingMessage,
    code: savedCode,
    isFetchingCode,
    fetchCode,
  } = useAdminStore();
  const code = savedCode?.codeNumber;
  useEffect(() => {
    fetchCode(id).catch((e: Error) => toast.error(e.message));
  }, [id, fetchCode]);

  const { user } = useUser(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof addCodeSchema>>({
    resolver: zodResolver(addCodeSchema),
  });

  const {
    register: registerMessage,
    handleSubmit: handleSubmitMessage,
    formState: { errors: errorsMessage },
  } = useForm<z.infer<typeof sendMessageSchema>>({
    resolver: zodResolver(sendMessageSchema),
  });

  const onSubmit = (data: z.infer<typeof addCodeSchema>) => {
    if (!id) return;
    toast.promise(addCode(id, data), {
      loading: "Adding code...",
      success: "Code added successfully",
      error: (e: Error) => e.message || "Failed to add code",
    });
  };

  const onSubmitMessage = (data: z.infer<typeof sendMessageSchema>) => {
    if (!id) return;
    toast.promise(sendMessage(id, data), {
      loading: "Sending message...",
      success: "Message sent successfully",
      error: (e: Error) => e.message || "Failed to send message",
    });
  };

  return (
    <DashboardLayout>
      <UserDetails userData={user} />
      <div className="flex gap-6 flex-wrap md:flex-nowrap">
        <Container title="Add Transaction Code">
          {code && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className=" font-medium">
                Current Code: {isFetchingCode ? "Loading..." : code}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-xs font-medium">
                  Code Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. Transfer Authentication Code"
                  className="input"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 pl-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="code" className="text-xs font-medium">
                  Code Number (Each code must be different from another)
                </label>
                <input
                  type="text"
                  id="code"
                  placeholder="e.g ASN/2893/1TWW/11T"
                  className="input"
                  {...register("code")}
                />
                {errors.code && (
                  <p className="text-xs text-red-500 pl-1">
                    {errors.code.message as string}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="instructions" className="text-xs font-medium">
                Instructions
              </label>
              <textarea
                rows={4}
                id="instructions"
                placeholder="Tell the client how to get the code. e.g. Send a text message to 448060000000 with the code"
                className="message w-full"
                {...register("instructions")}
              />
              {errors.instructions && (
                <p className="text-xs text-red-500 pl-1">
                  {errors.instructions.message as string}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isAddingCode}
              className="btn bg-gradient-1 text-white w-[150px] h-10 rounded-lg"
            >
              {isAddingCode ? "Adding Code..." : "Add Code"}
            </button>
          </form>
        </Container>

        <div className="w-full md:w-[30%] py-10 bg-gradient-to-br from-gradient-1 to-gradient-2 p-4 rounded-lg">
          <form
            onSubmit={handleSubmitMessage(onSubmitMessage)}
            className="flex flex-col justify-between h-full"
          >
            <div className="flex flex-col justify-center items-center gap-1">
              <label
                htmlFor="message"
                className="text-sm text-white font-medium"
              >
                Message
              </label>
              <textarea
                rows={4}
                id="message"
                placeholder="Enter the final message to be sent to the client after they get the code"
                className="message w-full"
                {...registerMessage("message")}
              />
              {errorsMessage.message && (
                <p className="text-xs text-red-500 pl-1">
                  {errorsMessage.message.message as string}
                </p>
              )}
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="radio"
                    value="successful"
                    {...registerMessage("status")}
                    className="accent-blue-600"
                  />
                  Successful
                </label>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="radio"
                    value="declined"
                    {...registerMessage("status")}
                    className="accent-blue-600"
                  />
                  Declined
                </label>
              </div>
              {errorsMessage.status && (
                <p className="text-xs text-red-500 pl-1">
                  {errorsMessage.status.message as string}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSendingMessage}
              className="bg-gradient-1 text-white w-[80%] mx-auto h-10  rounded-lg"
            >
              {isSendingMessage ? "Sending Message..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Codes;
