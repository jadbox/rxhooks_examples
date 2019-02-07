## Just Show Me the Code

```javascript
function ExampleUseRxState() {
  const [count, signalCount] = useRxState(1 as number, 
    scan( (acc:any, x:any)=>x+acc, 0) 
  );

  const onClick = () => {
    signalCount(1);
  }
  
  return <>
    <button onClick={onClick}>Add 1</button>
    <p>count {count}</p>
  </>
}

function ExampleUseRx() {
  const stream = (x:any) => interval(1000 * x);

  const [speed, setSpeed] = useState(1);
  const [count] = useRx( stream, speed );
  
  return <>
    <button onClick={() => setSpeed(speed+1)}>Make slower via initialValue change</button>
    <p>speed {speed}{' '}|{' '}count {count}</p>
  </>
}

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ExampleUseRx/>
          <br/>
          <ExampleUseRxState/>
        </header>
      </div>
    );
  }
}

export default App;
```
