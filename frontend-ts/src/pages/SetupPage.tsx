import styled from '@emotion/styled';
import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

import Footer from '../components/Footer';
import SentryLogo from '../components/SentryLogo';
import ThemedSelect, {OptionType} from '../components/ThemedSelect';
import {makeBackendRequest, Organization} from '../util';

const REDIRECT_TIMEOUT = 3 * 1000;

function SetupPage() {
  const [organizationId, setOrganizationId] = useState(null);
  const [organizationOptions, setOrganizationOptions] = useState<OptionType[]>([]);
  const [redirect, setRedirect] = useState('');
  useEffect(() => {
    async function fetchData() {
      const data: Organization[] = (await makeBackendRequest('/api/organization/')) || [];
      setOrganizationOptions(data.map(({id, name}) => ({value: id, label: name})));
    }
    fetchData();
  }, []);
  const [searchParams] = useSearchParams();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const payload = {
      code: searchParams.get('code'),
      installationId: searchParams.get('installationId'),
      sentryOrgSlug: searchParams.get('orgSlug'),
      organizationId,
    };
    const {redirectUrl} = await makeBackendRequest('/api/sentry/setup/', payload, {
      method: 'POST',
    });
    setRedirect(redirectUrl);
    setTimeout(() => (window.location = redirectUrl), REDIRECT_TIMEOUT);
  }

  return (
    <SetupWrapper>
      <Layout>
        <Form onSubmit={handleSubmit}>
          {redirect ? (
            <React.Fragment>
              <SentryLogo size={30} className="logo" />
              <h2>You&apos;ve successfully linked YOUR_APP and Sentry!</h2>
              <p>You should be redirected in a few seconds.</p>
              <a href={redirect} data-testid="direct-link">
                Take me back to Sentry
              </a>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <SentryLogo size={30} className="logo" />
              <Description />
              <p>
                Please choose an organization to associate your Sentry installation with:
              </p>
              <MapBlock>
                <SentryLogo size={20} />
                <h4>{searchParams.get('orgSlug')}</h4>
                <span>&gt;</span>
                <StyledSelect
                  options={organizationOptions}
                  onChange={({value}) => setOrganizationId(value)}
                  placeholder="Select an Organization..."
                />
              </MapBlock>
              <button type="submit" className="primary">
                Submit
              </button>
            </React.Fragment>
          )}
        </Form>
      </Layout>
      <Footer />
    </SetupWrapper>
  );
}
const SetupWrapper = styled.div`
  background: ${p => p.theme.gray100};
  display: flex;
  flex-flow: column;
  height: 100%;
  .logo {
    color: ${p => p.theme.surface100};
    margin: 0 auto;
    display: block;
    background: ${p => p.theme.gray300};
    box-sizing: content-box;
    padding: 1rem;
    border-radius: 1rem;
  }
`;

const Layout = styled.div`
  background: ${p => p.theme.surface100};
  flex: 1;
`;

const Form = styled.form`
  background: ${p => p.theme.gray100};
  margin: 3rem auto;
  max-width: 500px;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 2px 2px 8px ${p => p.theme.purple200};
  ul {
    padding-left: 2rem;
    li {
      margin: 0.5rem 0;
    }
  }
  hr {
    color: ${p => p.theme.purple200};
  }
  button {
    display: block;
    margin: 0 auto;
  }
`;

const MapBlock = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  h4 {
    margin: 2rem;
    text-align: right;
  }
  span {
    flex: 0;
  }
`;

const StyledSelect = styled(ThemedSelect)`
  flex: 1;
  margin: 2rem;
  font-size: ${p => p.theme.text.baseSize};
`;

const Description = () => (
  <>
    <h2>Complete your integration of Sentry with YOUR_APP!</h2>
    <p>
      By completing this installation, you&apos;ll gain access to the following features:
    </p>
    <h3>Webhooks</h3>
    <ul>
      <li>Track error/issue volume in Sentry</li>
      <li>Sync the comments/discussion happening in Sentry</li>
      <li>Do fancy stuff when Sentry events fire</li>
    </ul>
    <h3>Issue Linking and Alerting</h3>
    <ul>
      <li>Associate tickets with issues in Sentry</li>
      <li>Create tickets directly from Sentry</li>
      <li>Trigger notifications from alert rules in Sentry</li>
    </ul>
    <h3>Miscellaneous</h3>
    <ul>
      <li>
        Link directly to your code with <b>Stacktrace Linking</b>
      </li>
      <li>
        Access <b>Sentry&apos;s API</b> to do even more goodies
      </li>
    </ul>
    <hr />
  </>
);

export default SetupPage;