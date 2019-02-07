import React, { Component, useState, useEffect, useRef, useCallback, useReducer } from 'react';
import './App.css';
import { delay, take, shareReplay, map, reduce, zip, mergeMap, tap, scan } from 'rxjs/operators';
import { from, interval, Observable, of, fromEvent } from 'rxjs';
import { useFetch } from 'react-hooks-fetch';
import { EventEmitter } from 'events';

function incCount(setFn:(f:any)=>void, count:any) {
  return () => setFn(count+1)
}

function useRxState<T, X>(d:X, pipes:any) { 
  // input to stream
  const ref = useRef<EventEmitter | null>(null);

  // const [state, setState] = useState(d);

  // Final Output
  const [_state, _setState] = useState<T | undefined>(undefined);
  // console.log('_state', _state)

  useEffect( () => {

  }, [_state]);
  // let em:any;
  // let input$:Observable<any>;

  useEffect( () => {
    console.log('new stream')
    ref.current = new EventEmitter();
    var input$ = fromEvent(ref.current, 'event');
    const s = input$
             // .pipe(tap(x=>console.log('steam$',x)))
              .pipe(pipes)
              .subscribe((x:any)=>_setState(x)); // .pipe(pipes$())
    ref.current!.emit('event', d); // em.emit('event', 1);
    return () => s.unsubscribe();
  }, []);
  
  const setRx = (x:any) => {
    console.log('emit', x)
    ref.current!.emit('event', x)
    // setState(x);
  }
  // setState(x);
  return [_state as T, setRx] as [T, typeof setRx];
}

function HelloWorld3() {
  const [count, signalCount] = useRxState(1 as number, 
    scan( (acc:any, x:any)=>x+acc, 0) 
  );

  // const [counta, signalCounta] = useRx(1 as number, 
   //  (c:any) => reduce( (acc:any, x:any)=>x+acc, 0) 
  // );
  // if(!count) return null;

  const onClick = () => {
    // console.log('1 + count', 1 + count)
    signalCount(1);
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
          <HelloWorld/>
        </header>
      </div>
    );
  }
}

export default App;

function HelloWorld() {
  const stream = (x:any) => interval(1000 * x);

  const [speed, setSpeed] = useState(1);
  const [count] = useRx( stream, speed );
  
  return <>
    <button onClick={() => setSpeed(speed+1)}>Slower</button>
    <p>speed {speed}{' '}|{' '}count {count}</p>
  </>
}

function useRx<T, X>(stream: (c:X) => Observable<T>, data:X, onErr?:any, onComplete?:any): [T] {
  // input
  // const [state, setState] = useState(data);
  // console.log('speed', state)

  // Final Output
  const [_state, _setState] = useState<T | undefined>(undefined);
  

  useEffect( () => {
    const s = stream(data)
      .subscribe( x => _setState(x), onErr, onComplete );
    return () => s.unsubscribe();
  }, [data]);
  
  return [_state as T];
}