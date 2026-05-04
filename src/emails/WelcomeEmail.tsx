import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export type WelcomeEmailProps = {
  appUrl?: string;
  logoUrl?: string;
};

const defaultAppUrl = 'https://myzyra.xyz';
const defaultLogoUrl =
  'https://resend-attachments.s3.amazonaws.com/c3a39be3-fe72-4c5f-bfd5-71d1d3f18703';

export default function WelcomeEmail({
  appUrl = defaultAppUrl,
  logoUrl = defaultLogoUrl,
}: WelcomeEmailProps) {
  return (
    <Html dir="ltr" lang="en">
      <Head />
      <Preview>Zyra — getting started takes less than 2 minutes</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.p}>
              <strong>Hi</strong> it&apos;s so nice to meet you!
            </Text>
            <Text style={styles.p}>
              Im the Co-Founder of <strong>Zyra</strong> and wanted to give you a
              few helpers
            </Text>
            <Text style={styles.p}>
              You can now create invoices, track payments, and accept modern
              payments for your business.
            </Text>
            <Text style={styles.p}>Getting started takes less than 2 minutes.</Text>
            <Text style={styles.p}>
              Try it out at{' '}
              <Link href={appUrl} target="_blank" rel="noopener noreferrer">
                {new URL(appUrl).host}
              </Link>{' '}
              and send a &quot;Hi&quot; and I will personally help you get set
              up.
            </Text>

            <Text style={styles.p}>
              Need help? Just reply to this email and we’ll help you get set up.
            </Text>

            <Img
              alt='The Zyra logo with the tagline "payments and invoicing" on a dark textured background.'
              height={207}
              width={293}
              src={logoUrl}
              style={styles.heroImg}
            />

            <Hr style={styles.hr} />

            <Text style={styles.footer}>
              Zyra
              <br />
              Modern invoicing for businesses in Ghana
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#ffffff',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  container: {
    maxWidth: '600px',
    padding: '0px',
    color: '#000000',
    lineHeight: '155%',
  },
  p: {
    margin: 0,
    paddingTop: '0.5em',
    paddingBottom: '0.5em',
    fontSize: '1em',
  },
  heroImg: {
    display: 'block',
    outline: 'none',
    border: 'none',
    textDecoration: 'none',
    maxWidth: '100%',
    borderRadius: '8px',
    marginTop: '12px',
  },
  hr: {
    borderColor: '#e5e7eb',
    margin: '20px 0',
  },
  footer: {
    margin: 0,
    fontSize: '1em',
    paddingTop: '0.5em',
    paddingBottom: '0.5em',
  },
};

