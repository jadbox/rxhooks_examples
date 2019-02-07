import React, { Component, useState, useEffect, useRef, useCallback, useReducer } from 'react';
import './App.css';
// import { useFetch } from 'react-hooks-fetch';
import { scan } from 'rxjs/operators';
import { interval, Observable, fromEvent, OperatorFunction } from 'rxjs';
import { EventEmitter } from 'events';

/*
  useRx is a hook that takes a Observable (via a function that returns one) and useRx returns [currentStreamOutput] to use the output value in your component.
  The stream will rerun anytime the second paramater "data" is changed.
  onErr and onComplete parameters are callbacks for those stream states
*/
function useRx<T, X>(stream: (c:X) => Observable<T>, initialValue:X, onErr?:(error: any) => void, onComplete?:()=>void):[T] { 
  // Output state
  const [_state, _setState] = useState<T | undefined>(undefined);

  useEffect( () => {
    const s = stream(initialValue)
      .subscribe( x => _setState(x), onErr, onComplete );
    return () => s.unsubscribe();
  }, [initialValue]);
  
  return [_state as T];
}

/*
  useRxState allows adding items to an Rx stream that is created for you.
  The pipes parameter allows passing in Rx operators to work with internal source stream.
  onErr and onComplete parameters are callbacks for those stream states
*/
function useRxState<T, X>(initialValue:X, pipes:OperatorFunction<any,any>, onErr?:(error: any) => void, onComplete?:()=>void):[T,(x:X) => void] { 
  // input to stream
  const ref = useRef<EventEmitter | null>(null);

  // Output state
  const [_state, _setState] = useState<T | undefined>(undefined);

  useEffect( () => {

  }, [_state]);

  useEffect( () => {
    console.log('new stream')
    ref.current = new EventEmitter();
    var input$ = fromEvent(ref.current, 'event');
    const s = input$
              .pipe(pipes)
              .subscribe((x:any)=>_setState(x));
    ref.current!.emit('event', initialValue);
    return () => s.unsubscribe();
  }, [initialValue]);
  
  const setRx = (x:any) => {
    ref.current!.emit('event', x)
  }
  return [_state as T, setRx];
}

function ExampleUseRxState() {
  const [count, signalCount] = useRxState(1 as number, 
    scan( (acc:any, x:any)=>x+acc, 0) 
  );

  const onClick = () => {
    signalCount(1);
  }
  
  return <>
    <button onClick={onClick}>Slower</button>
    <p>count {count}</p>
  </>
}

function ExampleUseRx() {
  const stream = (x:any) => interval(1000 * x);

  const [speed, setSpeed] = useState(1);
  const [count] = useRx( stream, speed );
  
  return <>
    <button onClick={() => setSpeed(speed+1)}>Slower</button>
    <p>speed {speed}{' '}|{' '}count {count}</p>
  </>
}

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ExampleUseRxState/>
          <ExampleUseRx/>
        </header>
      </div>
    );
  }
}

export default App;