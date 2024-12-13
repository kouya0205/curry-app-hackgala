'use server';

import { parseWithZod } from '@conform-to/zod';
import { Provider } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

import { supabaseErrorMessages } from '@/config/errorMessage';
import { loginSchema, signupSchema } from '@/config/schema';

import { createClient } from '@/utils/supabase/server';
import { decode } from 'punycode';

export async function emailLogin(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const submission = parseWithZod(formData, {
    schema: loginSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    const errorMessage = error.code
      ? supabaseErrorMessages[error.code]
      : '不明なエラーが発生しました';
    return submission.reply({
      formErrors: [errorMessage],
    });
  }

  redirect('/');
}

export async function signup(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const submission = parseWithZod(formData, {
    schema: signupSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (error) {
    const errorMessage = error.code
      ? supabaseErrorMessages[error.code]
      : '不明なエラーが発生しました';
    return submission.reply({
      formErrors: [errorMessage],
    });
  }

  redirect('/');
}

export async function socialSignIn(provider: Provider) {
  const getURL = (path: string) => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ??
      process?.env?.NEXT_PUBLIC_VERCEL_URL ??
      'http://localhost:3000/';
    url = url.startsWith('http') ? url : `https://${url}`;
    url = url.endsWith('/') ? url : `${url}/`;
    path = path.replace(/^\//, '');
    return path ? `${url}${path}` : url;
  };

  if (!provider) {
    return redirect('/auth');
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
      redirectTo: getURL('/auth/callback'),
    },
  });
  if (error) {
    return { success: false, message: 'OAuth認証に失敗しました' };
  }
  return redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

// export async function updateProfile(values: any) {
//   try {
//     const supabase = await createClient();

//     let avatar_url = values.profile.avatar_url;

//     if (values.base64Image) {
//       const matches = values.base64Image.match(/^data:(.+);base64,(.+)$/);

//       if (!matches || matches.length !== 3) {
//         return { error: '無効な画像データです' };
//       }

//       const contentType = matches[1]; // 例: "image/png"
//       const base64Data = matches[2];

//       // 拡張子を取得
//       const fileExt = contentType.split('/')[1]; // 例: "png"

//       // ファイル名を生成
//       const fileName = `${uuidv4()}.${fileExt}`;

//       const { error: storageError } = await supabase.storage
//         .from('avatars')
//         .upload(`${values.profile.id}/${fileName}`, decode(base64Data), {
//           contentType,
//         });

//       if (storageError) {
//         return { error: storageError.message };
//       }

//       if (avatar_url) {
//         const fileName = avatar_url.split('/').slice(-1)[0];

//         // 古い画像を削除
//         await supabase.storage.from('avatars').remove([`${values.profile.id}/${fileName}`]);
//       }

//       // 画像のURLを取得
//       const { data: urlData } = await supabase.storage
//         .from('avatars')
//         .getPublicUrl(`${values.profile.id}/${fileName}`, {});

//       avatar_url = urlData.publicUrl;
//     }

//     // プロフィールアップデート
//     const { error: updateError } = await supabase
//       .from('users')
//       .update({
//         username: values.username,
//         avatar_url,
//       })
//       .eq('id', values.profile.id);

//     // エラーチェック
//     if (updateError) {
//       return { error: updateError.message };
//     }
//     return { success: true, message: 'プロフィールを更新しました' };
//   } catch (err) {
//     console.error(err);
//     return {
//       success: false,
//       message: 'プロフィールの更新中にエラーが発生しました',
//     };
//   }
// }
