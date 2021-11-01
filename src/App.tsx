import React, { useCallback, useEffect, useState } from 'react';
import './app.css';
type Args = { [argname: string]: boolean };
type Operation = 'and' | 'or' | 'set' | 'args';

function testEval() {
  const args1 = {
    arg1: true,
    arg2: false,
    arg3: true,
    arg4: true,
    arg5: false,
    arg6: true,
  };
  const args2 = {
    arg1: true,
    arg2: true,
    arg3: true,
    arg4: true,
    arg5: true,
    arg6: true,
  };
  const args3 = {
    arg1: false,
    arg2: false,
    arg3: false,
    arg4: false,
    arg5: false,
    arg6: false,
  };
  const args4 = {
    arg1: true,
    arg2: false,
    arg3: false,
  };

  const tests = [
    evaluateOperation('and', args1) === false,
    evaluateOperation('and', args2) === true,
    evaluateOperation('and', args3) === false,
    evaluateOperation('and', args4) === false,

    evaluateOperation('or', args1) === true,
    evaluateOperation('or', args2) === true,
    evaluateOperation('or', args3) === false,
    evaluateOperation('or', args4) === true,

    evaluateOperation('set', args1) === true,
    evaluateOperation('set', args2) === true,
    evaluateOperation('set', args3) === false,
    evaluateOperation('and', args4) === true,

    evaluateOperation('set', {}) === null,
    evaluateOperation('and', {}) === null,
    evaluateOperation('or', {}) === null,
  ];
  console.table(tests);
}

function and(args: Args) {
  return Object.entries(args).reduce(
    (prevV, [_, argValue]) => prevV && argValue,
    true
  );
}

function or(args: Args) {
  return Object.entries(args).reduce(
    (prevV, [_, argValue]) => prevV || argValue,
    false
  );
}

function evaluateOperation(operation: Operation, args: Args): boolean | null {
  let bool: boolean = true;
  if (Object.keys(args).length === 0) {
    return null;
  }

  switch (operation) {
    case 'and':
      bool = and(args);
      break;
    case 'or':
      console.log('or', args, or(args));

      bool = or(args);
      break;
    case 'set':
    case 'args':
      bool = Object.values(args)[0];
      break;

    default:
      break;
  }

  return bool;
}

function OperationBuilder({
  operation = 'set',
  onChange,
  obligatoryField = false,
  args,
  operationId,
}: {
  operation: Operation;
  // onChange: (operation: Operation) => void;
  onChange: (props: any) => void;
  operationId: number;
  setResult?: any;
  args: Args;
  obligatoryField?: boolean;
}): JSX.Element {
  const [extraOperations, setExtraOperations] = useState<number[]>([]);
  const [fieldType, setFieldType] = useState<Operation | 'select'>('select');
  const [operationArgs, setOperationArgs] = useState<Args>({
    [operationId]: false,
  });

  const selectField = (
    <>
      <select
        value={fieldType}
        onChange={(e: any) => {
          setFieldType(e.target.value);
        }}
      >
        <option value='select' disabled>
          select
        </option>
        <option value='set'>constant</option>
        <option value='args'>argument</option>
        <option value='and'>and</option>
        <option value='or'>or</option>
      </select>
      {obligatoryField && (
        <button className='w-22 h-22' onClick={() => setFieldType('select')}>
          X
        </button>
      )}
    </>
  );
  const constantField = (
    <>
      <select
        onChange={(e) => {
          setOperationArgs((prevArgs) => ({
            ...prevArgs,
            [operationId]: e.target.value === 'true' ? true : false,
          }));
        }}
      >
        <option value='true'>true</option>
        <option value='false'>false</option>
      </select>
      {obligatoryField && (
        <button className='w-22 h-22' onClick={() => setFieldType('select')}>
          X
        </button>
      )}
    </>
  );

  const argumentField = (
    <>
      <select
        onChange={(e) => {
          const argName = e.target.value;

          if (argName !== 'select') {
            setOperationArgs({ [operationId]: args[argName] });
          }
        }}
      >
        <option value='select' disabled>
          select
        </option>
        {Object.entries(args).map(([argName, _]) => (
          <option value={argName} key={argName}>
            {argName}
          </option>
        ))}
      </select>
      {obligatoryField && (
        <button className='w-22 h-22' onClick={() => setFieldType('select')}>
          X
        </button>
      )}
    </>
  );

  const [field, setField] = useState(selectField);

  useEffect(() => {
    switch (fieldType) {
      case 'set':
        setField(constantField);
        break;
      case 'args':
        setField(argumentField);
        setOperationArgs((prevArgs) => ({
          ...prevArgs,
          [operationId]: Object.values(args)[0],
        }));
        break;
      case 'and':
      case 'or':
        setField(
          <>
            {selectField}
            <div className='ml-4'>
              <OperationBuilder
                operation={fieldType}
                args={args}
                obligatoryField
                onChange={setOperationArgs}
                operationId={0}
              />
              <OperationBuilder
                operation={fieldType}
                args={args}
                obligatoryField
                onChange={setOperationArgs}
                operationId={1}
              />
              {extraOperations.map((operationNum) => (
                <div className='flex-row' key={operationNum}>
                  <OperationBuilder
                    args={args}
                    operation={fieldType}
                    onChange={setOperationArgs}
                    operationId={operationNum}
                  />
                  <button
                    className='w-22 h-22'
                    onClick={() => {
                      deleteOperation(operationNum);
                      setOperationArgs((prevArgs) => {
                        delete prevArgs[operationNum];
                        return prevArgs;
                      });
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
              <button onClick={addOperation}>+ add op</button>
            </div>
          </>
        );
        break;

      default:
        setField(selectField);
        break;
    }
  }, [fieldType, args, extraOperations, operation]);

  useEffect(() => {
    if (fieldType !== 'select') {
      onChange((prevArgs: Args) => ({
        ...prevArgs,
        [operationId]: evaluateOperation(fieldType, operationArgs),
      }));
    }
  }, [fieldType, extraOperations, operationArgs, args]);

  function addOperation() {
    setExtraOperations((prevOperations) => {
      console.log('extraOperations', prevOperations);

      return [...prevOperations, prevOperations[prevOperations.length - 1] + 1];
    });
  }

  function deleteOperation(id: number) {
    setExtraOperations((prevOperations) => {
      console.log('extra operation', id);
      console.log('operatons', prevOperations);

      prevOperations.splice(id, 1);
      return [...prevOperations];
    });
  }

  return <div>{field}</div>;
}

export default function App() {
  ///////////////
  // test poper logical evaluation
  // testEval();
  ///////////////
  const [result, setResult] = useState<boolean | null>(null);
  const [args, setArgs] = useState<Args>({ 'My Arg': false });

  function onChangeArgName(
    e: any,
    argId: number,
    argValue: boolean,
    argArray: any[][]
  ) {
    const newName = e.target.value;
    argArray[argId] = [newName, argValue];
    setArgs(
      argArray.reduce<Args>((argsObj, argArrayArg) => {
        argsObj[argArrayArg[0]] = argArrayArg[1];
        return argsObj;
      }, {})
    );
  }

  return (
    <main>
      <div className='mb-4'>
        {Object.entries(args).map(([argName, argValue], argId, argArray) => {
          return (
            <div className='flex-row' key={argName + 'arg'}>
              <input
                value={argName}
                onChange={(e) => onChangeArgName(e, argId, argValue, argArray)}
              />
              <select
                value={argValue.toString()}
                onChange={(e) =>
                  setArgs((prevArgs) => ({
                    ...prevArgs,
                    [argName]: e.target.value === 'true' ? true : false,
                  }))
                }
              >
                <option value='false'>false</option>
                <option value='true'>true</option>
              </select>
            </div>
          );
        })}
        <button
          onClick={() => {
            setArgs((prevArgs) => ({ ...prevArgs, newarg: false }));
          }}
        >
          +add arg
        </button>
      </div>
      <div className='mb-4'>
        <OperationBuilder
          args={args}
          operation='set'
          obligatoryField
          onChange={setResult}
          operationId={0}
        />
      </div>
      <div>
        result:{' '}
        {result && typeof Object.values(result)[0] === 'boolean'
          ? Object.values(result)[0].toString()
          : 'undefined'}
      </div>
    </main>
  );
}
