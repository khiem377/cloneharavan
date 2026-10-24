import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerGroupService } from '@/services/customerGroup.service';

export const CUSTOMER_GROUPS_KEY = ['customer_groups'];

export const useCustomerGroups = (params) =>
  useQuery({
    queryKey: [...CUSTOMER_GROUPS_KEY, params],
    queryFn: () => customerGroupService.getGroups(params),
    staleTime: 30_000,
  });

export const useCustomerGroupOptions = () =>
  useQuery({
    queryKey: [...CUSTOMER_GROUPS_KEY, 'options'],
    queryFn: () => customerGroupService.getOptions(),
    staleTime: 60_000,
  });

export const useCreateCustomerGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => customerGroupService.createGroup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMER_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateCustomerGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerGroupService.updateGroup(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMER_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteCustomerGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => customerGroupService.deleteGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMER_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useSyncCustomerGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => customerGroupService.syncMembers(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMER_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useSeedCustomerGroups = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customerGroupService.seedDefaultGroups(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMER_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
