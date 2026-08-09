"use server"

import { revalidatePath } from "next/cache"

import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { auth } from "@/lib/auth/server"
import {
  removeFriendship,
  respondToFriendRequest,
  sendFriendRequest,
} from "@/lib/friends/service"
import { getTranslator } from "@/lib/i18n/get-locale"

export type FriendActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string }

async function requireUserId(): Promise<
  { ok: true; userId: string } | { ok: false; message: string }
> {
  const t = await getTranslator()
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    return { ok: false, message: t("action.loginRequired") }
  }

  const userId = await ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  return { ok: true, userId }
}

function friendErrorMessage(
  code: string,
  t: Awaited<ReturnType<typeof getTranslator>>,
) {
  switch (code) {
    case "user_not_found":
      return t("friends.errorUserNotFound")
    case "cannot_add_self":
      return t("friends.errorSelf")
    case "already_friends":
      return t("friends.errorAlreadyFriends")
    case "already_pending":
      return t("friends.errorAlreadyPending")
    case "not_found":
      return t("friends.errorNotFound")
    case "forbidden":
      return t("friends.errorForbidden")
    case "not_pending":
      return t("friends.errorNotPending")
    default:
      return t("friends.errorGeneric")
  }
}

export async function sendFriendRequestAction(
  email: string,
): Promise<FriendActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  const trimmed = email.trim()
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, message: t("friends.errorInvalidEmail") }
  }

  const result = await sendFriendRequest(user.userId, trimmed)
  if (!result.ok) {
    return { ok: false, message: friendErrorMessage(result.code, t) }
  }

  revalidatePath("/friends")
  return { ok: true, message: t("friends.requestSent") }
}

export async function acceptFriendRequestAction(
  friendshipId: string,
): Promise<FriendActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  const result = await respondToFriendRequest(user.userId, friendshipId, true)
  if (!result.ok) {
    return { ok: false, message: friendErrorMessage(result.code, t) }
  }

  revalidatePath("/friends")
  return { ok: true, message: t("friends.requestAccepted") }
}

export async function declineFriendRequestAction(
  friendshipId: string,
): Promise<FriendActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  const result = await respondToFriendRequest(user.userId, friendshipId, false)
  if (!result.ok) {
    return { ok: false, message: friendErrorMessage(result.code, t) }
  }

  revalidatePath("/friends")
  return { ok: true, message: t("friends.requestDeclined") }
}

export async function removeFriendAction(
  friendshipId: string,
): Promise<FriendActionResult> {
  const t = await getTranslator()
  const user = await requireUserId()
  if (!user.ok) return user

  const result = await removeFriendship(user.userId, friendshipId)
  if (!result.ok) {
    return { ok: false, message: friendErrorMessage(result.code, t) }
  }

  revalidatePath("/friends")
  return { ok: true, message: t("friends.removed") }
}
