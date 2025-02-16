import { getSession } from "next-auth/react";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

export default function requireAuth<T>(gssp?: (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<T>>) {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const session = await getSession({ req: context.req });

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      } as GetServerSidePropsResult<T>;
    }

    return gssp ? await gssp(context) : { props: { session } } as GetServerSidePropsResult<T>;
  };
}
