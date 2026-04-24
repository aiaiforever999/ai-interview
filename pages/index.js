// pages/index.js
// Redirect ไปยัง app.html ที่อยู่ใน /public

export default function Home() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: { destination: '/app.html', permanent: false },
  };
}
