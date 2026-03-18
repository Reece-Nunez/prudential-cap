import RecaptchaProvider from '../components/RecaptchaProvider';

export const metadata = {
  title: 'Apply | Prudential Capital',
  description: 'Submit your business funding application. Same-day approvals, funding in 24-48 hours.',
  openGraph: {
    title: 'Apply | Prudential Capital',
    description: 'Submit your business funding application. Same-day approvals, funding in 24-48 hours.',
    images: ['/prud-cap-logo.png'],
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <RecaptchaProvider>{children}</RecaptchaProvider>;
}
