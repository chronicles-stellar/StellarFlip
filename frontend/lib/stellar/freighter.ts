export type WalletSnapshot = {
  address: string | null;
  network: string | null;
};

export async function isFreighterAvailable() {
  if (typeof window === "undefined") {
    return false;
  }

  const freighter: any = await import("@stellar/freighter-api");
  return Boolean(await freighter.isConnected?.());
}

export async function connectFreighter(): Promise<WalletSnapshot> {
  const freighter: any = await import("@stellar/freighter-api");
  const access = await freighter.requestAccess?.();

  if (access?.error) {
    throw new Error(access.error);
  }

  const addressResult = await freighter.getAddress?.();
  const networkResult = await freighter.getNetworkDetails?.();

  return {
    address: addressResult?.address ?? addressResult ?? access?.address ?? null,
    network: networkResult?.network ?? networkResult?.networkPassphrase ?? null,
  };
}

export async function getFreighterSnapshot(): Promise<WalletSnapshot> {
  const freighter: any = await import("@stellar/freighter-api");
  const allowed = await freighter.isAllowed?.();

  if (!allowed) {
    return { address: null, network: null };
  }

  const addressResult = await freighter.getAddress?.();
  const networkResult = await freighter.getNetworkDetails?.();

  return {
    address: addressResult?.address ?? addressResult ?? null,
    network: networkResult?.network ?? networkResult?.networkPassphrase ?? null,
  };
}
