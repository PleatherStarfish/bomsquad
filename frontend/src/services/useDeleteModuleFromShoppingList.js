import { useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useDeleteShoppingListItem = () => {
    const csrftoken = Cookies.get('csrftoken');
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: ({ module_pk }) => {
            
            const module_pkCleaned = removeAfterUnderscore(module_pk)

            if (module_pkCleaned) {
                return axios.delete(`/api/shopping-list/${module_pkCleaned}/delete/`, {
                    headers: {
                        'X-CSRFToken': csrftoken,
                    },
                    withCredentials: true,
                });
            } else {
                return axios.delete(`/api/shopping-list/delete-anonymous/`, {
                    headers: {
                        'X-CSRFToken': csrftoken,
                    },
                    withCredentials: true,
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries('userShoppingList');
            queryClient.refetchQueries('userShoppingList');
        },
    });

    return deleteMutation;
};

export default useDeleteShoppingListItem;
