import Footer from '@/components/Top/Footer';
import Header from '@/components/Top/Header';
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <>
      <Header user={user} />
      <div className="flex flex-col items-center justify-center py-2 min-h-screen">
        <h1>感謝!</h1>
      </div>
      <Footer />
    </>
  );
}
