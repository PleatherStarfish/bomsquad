import Cookies from "js-cookie";
import { useQuery, useMutation, UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { TransformedComponentData } from "../types/createComponentForm";

// Fetch dropdown options for the form
const useGetComponentDropdownOptions = (): UseQueryResult<any, Error> => {
  const csrftoken = Cookies.get("csrftoken");

  return useQuery({
    queryFn: async () => {
      try {
        const response = await axios.get("/api/components/options/", {
          headers: {
            "X-CSRFToken": csrftoken || "",
          },
          withCredentials: true,
        });

        return response.data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new Error("Failed to fetch dropdown options.");
      }
    },
    queryKey: ["componentDropdownOptions"],
  });
};

// Submit a new component
const useCreateComponent = (): UseMutationResult<
  any, // Replace with the response type if known
  Error,
  TransformedComponentData
> => {
  const csrftoken = Cookies.get("csrftoken");

  return useMutation({
    mutationFn: async (componentData: TransformedComponentData) => {
      console.log("IN SERVICE", componentData)
      try {
        const response = await axios.post("/api/components/create/", componentData, {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken || "",
          },
          withCredentials: true,
        });

        return response.data;
      } catch (error: any) {
        if (error.response && error.response.data) {
          throw new Error(
            `Failed to submit component: ${JSON.stringify(error.response.data)}`
          );
        } else {
          throw new Error("An unexpected error occurred while submitting the component.");
        }
      }
    },
  });
};

export { useGetComponentDropdownOptions, useCreateComponent };
