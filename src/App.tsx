import React, { Component, useState, useEffect, useRef, useCallback, useReducer } from 'react';
import './App.css';
import { delay, take, shareReplay, map, reduce } from 'rxjs/operators';
import { from, interval, Observable, of } from 'rxjs';
import { useFetch } from 'react-hooks-fetch';

function incCount(setFn:(f:any)=>void, count:any) {
  return () => setFn(count+1)
}

function useRx<T, X>(stream: (c:X) => Observable<T>, data:X, fn?:any): [T, (x:X) =>void] {
  
  
  // By default, replace data from last stream
  if(!fn) fn = (state:any, next:any) => next;

  // Reduce over streams source changes
  function reducer(state:any, action:any) {
    switch (action.type) {
      case 'step':
        const step = fn(state, action.val);
        console.log('new state', step);
        return step;
      default:
        return state;
    }
  }
  // input
  const [state, dispatch] = useReducer(reducer, data);

  // Final Output
  const [_state, _setState] = useState<T | undefined>(undefined);
  

  useEffect( () => {
    console.log('new stream')
    const s = stream(state)
      .subscribe( x => _setState(x) );
    return () => s.unsubscribe();
  }, [stream, state]);
  
  const setRx = (x:any) => dispatch({type:'step', val: x});
  return [_state as T, setRx];
}

function stream(c:number) {
  // return of(c);
  return interval(1000).pipe(map( (x:number) => x + c )); // .pipe(map(x=>'c ' + c + ' x ' + x));
}

function HelloWorld() {
  const [speed, setSpeed] = useState(1);
  const [count] = useRx( stream, speed );
  
  return <>
    <button onClick={() => setSpeed(speed+1)}>Slower</button>
    <p>speed {speed}{' '}|{' '}count {count}</p>
  </>
}

function HelloWorld3() {
  const reducer = (prev:any, val:any) => val;
  const [count, signalCount] = useRx( stream, 1 as number, reducer );
  if(!count) return null;

  const onClick = () => {
    console.log('1 + count', 1 + count)
    signalCount(10 + count);
  }
  
  return <>
    <button onClick={onClick}>Slower</button>
    <p>count {count}</p>
  </>
}

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <HelloWorld3/>
        </header>
      </div>
    );
  }
}

export default App;

function HelloWorld2() {
  const [speed, setSpeed] = useState(0.5);
  const [count] = useRxCallback( speed, stream, map((x:any)=>x*2) );
  
  return <>
    <button onClick={incCount(setSpeed, speed)}>Slower</button>
    <p>speed {speed}{' '}|{' '}count {count}</p>
  </>
}

function useRxCallback2<T, X>(data:X) {
  const [state, setState] = useState<any>(null);
  const [obs, obsState] = useState<X | null>(null);

  let stream = (x:X) => {
    obsState(x);
  };
  useEffect( () => {
    if(!obs) return;
    const s = of(obs).subscribe( x => setState(x) );
    return () => s.unsubscribe();
  }, [data, obs]);
  
  return [state, stream]
}

function useRxCallback<T, X>(data:X, stream: (c:X) => Observable<T>, transform: any) {
  const [state, setState] = useState<any>(null);
  const ref = useRef<any>(null);

  useEffect(() => {
    ref.current = transform;
  });

  useEffect( () => {
    const src = stream(data);
    const op = ref.current ? 
        src.pipe(ref.current)
      : src;

    const s = op.subscribe( x => setState(x) )
    return () => s.unsubscribe();
  }, [data, transform]);
  
  return [state]
}

function useRx2<T, X>(stream: (c:X) => Observable<T>, data:X) {
  const [state, setState] = useState<any>(null);

  useEffect( () => {
    console.log('useEffect')
    const s = stream(data).subscribe( x => setState(x) );
    return () => s.unsubscribe();
  }, [data, stream]);
  
  return [state]
}