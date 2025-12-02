import { getDictionary } from "../get-dictionary";
import HomeClient from "./HomeClient";

export default async function Page({ params }: { params: Promise<{ lang: "en" | "vi" | "zh" | "ko" | "ja" }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <HomeClient dict={dict} />;
}
