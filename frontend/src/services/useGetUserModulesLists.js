import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const fetchUserModules = async (type) => {
    const { data } = await axios.get(`/api/modules/${type}/`, {
        withCredentials: true,
    });
    return data;
};

const useGetUserModulesLists = (type) => {
    const { 
        data: userModulesList, 
        isLoading: userModulesListIsLoading, 
        isError: userModulesListIsError, 
        error: userModulesListError 
    } = useQuery({
        queryKey: ['userModulesList', type],
        queryFn: () => fetchUserModules(type)
    });

    return { 
        userModulesList, 
        userModulesListIsLoading, 
        userModulesListIsError, 
        userModulesListError 
    };
};

export default useGetUserModulesLists;
