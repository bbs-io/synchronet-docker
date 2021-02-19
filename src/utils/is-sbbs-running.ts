import docker from "@tracker1/docker-cli";

/**
 * Is there an "sbbs" container running currently.
 *
 * @returns Promise<boolean>
 */
export default async () => {
  const result = await docker("ps");
  return !!result.containerList.filter((c: any) => c.names === "sbbs").length;
};
