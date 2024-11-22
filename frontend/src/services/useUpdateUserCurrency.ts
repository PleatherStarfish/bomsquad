import Cookies from "js-cookie";
import axios from "axios";
import { currencyLookup } from "../types/currency";
import { useMutation } from "@tanstack/react-query";

type CurrencyCode = keyof typeof currencyLookup;

type UpdateCurrencyResponse = {
  message: string;
};

const useUpdateUserCurrency = () => {
        const csrftoken = Cookies.get("csrftoken");
      
        const updateUserCurrency = async (currency: CurrencyCode): Promise<UpdateCurrencyResponse> => {
          if (!currencyLookup[currency]) {
            throw new Error("Invalid currency code");
          }
      
          const response = await axios.patch<UpdateCurrencyResponse>(
            "/api/user-update-currency/",
            { default_currency: currency },
            {
              headers: {
                "X-CSRFToken": csrftoken || "",
              },
              withCredentials: true,
            }
          );
          return response.data;
        };
      
        const { mutate, isError, isSuccess } = useMutation<
          UpdateCurrencyResponse, 
          Error, 
          CurrencyCode
        >({
          mutationFn: updateUserCurrency, 
        });
      
        return { isError, isSuccess, mutate };
      };

export default useUpdateUserCurrency;
