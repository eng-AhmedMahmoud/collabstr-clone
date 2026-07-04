import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import { uploadAvatar } from "./upload";
import { qk } from "./queries";
import type { BroadcastInput, CampaignInput, MawthooqInput, MawthooqReviewInput, OrderInput, PackageInput } from "@collabstr/shared-types";

// ─── Creator save / packages ─────────────────────────────────────────────────

export function useToggleSaveCreator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (creatorId: string) => api<{ saved: boolean }>(`/creators/${creatorId}/save`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.savedCreators() });
    },
  });
}

export function useAddPackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PackageInput) => api<{ id: string }>("/creators/me/packages", { method: "POST", body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.creatorMe() });
    },
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/creators/me/packages/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.creatorMe() });
    },
  });
}

export function useSubmitMawthooq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MawthooqInput) => api<void>("/creators/me/mawthooq", { method: "POST", body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.creatorMe() });
      qc.invalidateQueries({ queryKey: qk.me });
    },
  });
}

export function useUpdateCreatorProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => api<void>("/creators/me", { method: "PATCH", body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.creatorMe() });
    },
  });
}

// ─── User profile ────────────────────────────────────────────────────────────

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (asset: { uri: string; name?: string; mimeType?: string }) =>
      uploadAvatar(asset),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.me }),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name?: string; avatarUrl?: string; locale?: "en" | "ar" }) =>
      api<void>("/users/me", { method: "PATCH", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.me }),
  });
}

export function useSetLocale() {
  return useMutation({
    mutationFn: (locale: "en" | "ar") => api<void>("/users/me/locale", { method: "POST", body: { locale } }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { current: string; next: string }) =>
      api<void>("/users/me/password", { method: "POST", body: input }),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api<void>("/users/me", { method: "DELETE" }),
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

function invalidateOrder(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.invalidateQueries({ queryKey: qk.orderById(id) });
  qc.invalidateQueries({ queryKey: ["orders"] });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderInput) => api<{ id: string }>("/orders", { method: "POST", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useOrderAction(id: string, action: "pay" | "accept" | "approve" | "release" | "cancel") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>(`/orders/${id}/${action}`, { method: "POST" }),
    onSuccess: () => invalidateOrder(qc, id),
  });
}

export function useSubmitDeliverable(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { url: string; note?: string }) =>
      api<void>(`/orders/${id}/submit`, { method: "POST", body: input }),
    onSuccess: () => invalidateOrder(qc, id),
  });
}

export function useRequestRevision(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { note: string }) =>
      api<void>(`/orders/${id}/revision`, { method: "POST", body: input }),
    onSuccess: () => invalidateOrder(qc, id),
  });
}

export function useDisputeOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { reason: string }) =>
      api<void>(`/orders/${id}/dispute`, { method: "POST", body: input }),
    onSuccess: () => invalidateOrder(qc, id),
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function useLeaveReview(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { rating: number; text: string }) =>
      api<void>(`/reviews/order/${orderId}`, { method: "POST", body: input }),
    onSuccess: () => invalidateOrder(qc, orderId),
  });
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export function useSendMessage(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api<void>(`/threads/${threadId}/messages`, { method: "POST", body: { body } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.messages(threadId) });
      qc.invalidateQueries({ queryKey: qk.threads() });
    },
  });
}

export function useOpenThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => api<{ id: string }>(`/threads/open/${username}`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.threads() }),
  });
}

export function useMarkThreadRead(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>(`/threads/${threadId}/read`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.threads() }),
  });
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>("/notifications/read-all", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications() }),
  });
}

// ─── Campaigns / applications ───────────────────────────────────────────────

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CampaignInput) => api<{ id: string }>("/campaigns", { method: "POST", body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myCampaigns() });
      qc.invalidateQueries({ queryKey: qk.campaigns() });
    },
  });
}

export function useUpdateCampaignStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: "open" | "closed" | "draft") =>
      api<void>(`/campaigns/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.campaignById(id) });
      qc.invalidateQueries({ queryKey: qk.myCampaigns() });
    },
  });
}

export function useApplyToCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { price: number; pitch: string }) =>
      api<void>(`/campaigns/${id}/apply`, { method: "POST", body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myApplications() });
      qc.invalidateQueries({ queryKey: qk.campaignById(id) });
    },
  });
}

export function useWithdrawApplication(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>(`/applications/${id}/withdraw`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.myApplications() }),
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useAdminUserAction(id: string, action: "ban" | "unban" | "promote-admin") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>(`/admin/users/${id}/${action}`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useReviewMawthooq(creatorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MawthooqReviewInput) =>
      api<void>(`/admin/mawthooq/${creatorId}/review`, { method: "POST", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.adminMawthooq() }),
  });
}

export function useAdminOrderForce(id: string, action: "force-release" | "force-cancel" | "force-dispute") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { reason?: string; note?: string }) =>
      api<void>(`/admin/orders/${id}/${action}`, { method: "POST", body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminOrderById(id) });
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useAdminDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/admin/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.adminReviews() }),
  });
}

export function useAdminBroadcast() {
  return useMutation({
    mutationFn: (input: BroadcastInput) => api<void>("/admin/broadcast", { method: "POST", body: input }),
  });
}
