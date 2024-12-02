import { Module } from '../types/modules';

import { useQuery } from '@tanstack/react-query';

import axios from 'axios';

interface ModuleListItem {
  id: string;
  module: Module;
  datetime_updated: string;
  datetime_created: string;
  user: number;
  is_built: boolean;
  is_wtb: boolean;
}

interface UserModulesList {
    count: number;
    num_pages: number;
    results: ModuleListItem[];
}


const fetchUserModules = async (type: string): Promise<UserModulesList> => {
    const { data } = await axios.get<UserModulesList>(`/api/modules/${type}/`, {
        withCredentials: true,
    });
    return data;
};

const useGetUserModulesLists = (type: string) => {
    const {
        data: userModulesList,
        isLoading: userModulesListIsLoading,
        isError: userModulesListIsError,
        error: userModulesListError,
    } = useQuery<UserModulesList, Error>({
        queryFn: () => fetchUserModules(type),
        queryKey: ['userModulesList', type],
    });

    return {
        userModulesList,
        userModulesListError,
        userModulesListIsError,
        userModulesListIsLoading,
    };
};

export default useGetUserModulesLists;