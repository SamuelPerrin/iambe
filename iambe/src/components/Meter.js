import React, {useEffect} from 'react';
import { connect } from 'react-redux';
import { Link, useHistory, Redirect } from 'react-router-dom';

import { Pie } from 'react-chartjs-2';

import Breadcrumbs from './styled/Breadcrumbs';
import FlexRow from './styled/FlexRow';
import Container from './styled/Container';
import Section from './styled/Section';
import { YellowSpan, RedSpan } from './styled/Spans';
import ListItemTile from './styled/ListItemTile';
import PoemBox from './styled/PoemBox';
import StanzaTile from './styled/StanzaTile';
import Button from './styled/Button';
import ButtonRow from './styled/ButtonRow';

import { getLineMeterDetails, getRhymes, getStanzaMeterDetails } from '../actions';

import { COLOR_SEQUENCE } from '../constants/colors';
import Poem from '../utils/Poem';
import Stanza from '../utils/Stanza';

const Meter = props => {
  const { poetry, poems, stanzaMeterCounts, getLineMeterDetails, currentUser, getRhymes, getStanzaMeterDetails} = props;
  const history = useHistory();

  const submitLineMeterDetail = e => {
    e.preventDefault();
    getLineMeterDetails(e.target.attributes.stanzaNum.value);
    history.push("/meter/scansion");
  }

  const submitStanzaMeterDetail = e => {
    e.preventDefault();
    if ('rt' in e.target.dataset) getStanzaMeterDetails(e.target.dataset.rt);
    else if ('rt' in e.target.attributes) getStanzaMeterDetails(e.target.attributes.rt.value);
    else console.log("couldn't find rt in e",e);
    history.push("/meter/stanza");
  }

  const goToRhymes = e => {
    e.preventDefault();
    getRhymes(poetry);
    history.push("/rhyme");
  }

  const goToAddPoem = e => {
    e.preventDefault();
    history.push("/save-poem");
  }

  const counts = stanzaMeterCounts && Object.entries(stanzaMeterCounts).filter(x => x[1] > 0).sort((a,b) => b[1] - a[1]);
  
  const pieData = stanzaMeterCounts && {
    labels: counts.map(x => x[0]),
    datasets: [{
      label: "Meter by Stanza",
      data: counts.map(x => x[1]),
      backgroundColor: COLOR_SEQUENCE,
      borderWidth: 1,
    }]
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: false,
        labels: {
          display: false
        }
      }
    }
  };

  let stanzaNum = -1;

  useEffect(() => {
    window.scrollTo(0,0);
  }, []);

  if (!poetry) return <Redirect to='/' />;
  else return (
    <div>
      <Breadcrumbs>
        <Link to='/' key='Home'>Home</Link>
        <Link to='/meter' key='Meter' className='current'>Meter</Link>
      </Breadcrumbs>
      <FlexRow>
        <Container id="context">
          <Section>
            <h2><YellowSpan>Stanzas by Meter</YellowSpan></h2>
            <div style={{
              display:'flex',
              flexFlow:'row wrap',
              justifyContent: 'center',
            }}>
              <Pie
                data={pieData}
                style={{maxWidth:200,maxHeight:200}}
                options={pieOptions}
              />
              <div>
                {Object.entries(stanzaMeterCounts)
                  .reduce((a,b) => a+b[1], 0) > 1 ?
                    Object.entries(stanzaMeterCounts).filter(a => a[1] > 0).length === 1 ? 
                    <p>The only meter in this sample is:</p> :
                    <p>The most common meters in this sample are:</p> :
                  <p>This stanza's meter is:</p>}
                <ul>
                  {stanzaMeterCounts && counts.map((entry,i) => (
                    <ListItemTile
                      key={entry[0]}
                      onClick={submitStanzaMeterDetail}
                      rt={entry[0]}
                      bulletColor={COLOR_SEQUENCE[i % COLOR_SEQUENCE.length]}
                      className='legend'
                    >
                      {entry[0]} ({entry[1]} stanza{entry[1] > 1 ? 's' : ''})
                    </ListItemTile>
                  ))}
                </ul>
              </div>
            </div>
            <Link to="/meter/scansion"><YellowSpan>Read more »</YellowSpan></Link>
          </Section>
          <ButtonRow className="hide-for-mobile">
            <Button onClick={goToRhymes} size="small">Get Rhymes</Button>
            {currentUser &&
             !currentUser.poems.some(one => one.poem.text === poems[0]) &&
             <Button onClick={goToAddPoem} size="small">Save Poem</Button>}
          </ButtonRow>
        </Container>
        <Container id="text">
          <Section>
            <h2><RedSpan>Meter by Stanza</RedSpan></h2>
            <p>Select a stanza to learn more about its meter.</p>
            <PoemBox>
              {poems.map(poem => new Poem(poem).getStanzas().map(stanza => {
                    stanzaNum++
                    const thisStanza = new Stanza(stanza)
                    return <StanzaTile 
                      onClick={submitLineMeterDetail}
                      children={thisStanza.getLines()} 
                      hoverText={"Meter: " + thisStanza.getMeter()}
                      key={stanzaNum}
                      stanzaNum={stanzaNum}
                    />
                  }
                ))}
            </PoemBox>
          </Section>
          <ButtonRow>
            <Button onClick={goToRhymes} className="hide-for-desktop" size="small">Get Rhymes</Button>
            {currentUser &&
            !currentUser.poems.some(one => one.poem.text === poems[0]) &&
            <Button onClick={goToAddPoem} className="hide-for-desktop" size="small">Save Poem</Button>}
          </ButtonRow>
        </Container>
        </FlexRow>
    </div>
  )
}

const mapStateToProps = state => ({
  poetry: state.poetry,
  poems: state.poems,
  stanzaMeters: state.stanzaMeters,
  stanzaMeterCounts: state.stanzaMeterCounts,
  currentUser: state.currentUser,
})

export default connect(mapStateToProps, { getLineMeterDetails, getRhymes, getStanzaMeterDetails })(Meter)
