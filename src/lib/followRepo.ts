// src/lib/followRepo.ts
import { readLocal, writeLocal, removeLocal } from "./storage";

export type FollowedItem = string; // change later if you store objects

const KEY = "followed";

export function getFollowed(): FollowedItem[] {
  return readLocal<FollowedItem[]>(KEY, []);
}

export function setFollowed(list: FollowedItem[]) {
  writeLocal(KEY, list);
}

export function addFollowed(id: FollowedItem) {
  const current = getFollowed();
  if (current.includes(id)) return;
  setFollowed([...current, id]);
}

export function removeFollowed(id: FollowedItem) {
  const current = getFollowed();
  setFollowed(current.filter((x) => x !== id));
}

export function clearFollowed() {
  removeLocal(KEY);
}
