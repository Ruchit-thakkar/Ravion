import { Detail } from "@/components/ravion-client";
export default async function Page({ params }){ const { slug } = await params; return <Detail slug={slug}/>; }
