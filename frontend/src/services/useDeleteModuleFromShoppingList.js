import { useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';

const useDeleteShoppingListItem = () => {
    const csrftoken = Cookies.get('csrftoken');
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: ({ module_pk }) => {
            if (module_pk) {
                return axios.delete(`/api/shopping-list/${module_pk}/delete/`, {
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
