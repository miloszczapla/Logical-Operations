import React, { useEffect, useState } from 'react';
import './app.css';
type Args = { [argname: string]: boolean };
type Operation = 'and' | 'or' | 'set';

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

  const tests = [
    evaluateOperation('and', args1) === false,
    evaluateOperation('and', args2) === true,
    evaluateOperation('and', args3) === false,
    evaluateOperation('or', args1) === true,
    evaluateOperation('or', args2) === true,
    evaluateOperation('or', args3) === false,
    evaluateOperation('set', args1) === true,
    evaluateOperation('set', args2) === true,
    evaluateOperation('set', args3) === false,
  ];
  console.table(tests);
}

/* ...todo:
a system for defining logical operations 
(not, and, or... more if you want) that can be passed:
 - selected args by name: (X and Y)
 - constant values not dependent on args: (true and X)
 - other operations: ((X and Y) or Z) 
 */

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

function evaluateOperation(operation: Operation, args: Args): boolean {
  let bool: boolean = true;

  switch (operation) {
    case 'and':
      bool = and(args);
      break;
    case 'or':
      bool = or(args);
      break;
    case 'set':
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
}: {
  operation: Operation;
  // onChange?: (operation: Operation) => void;
  onChange?: any;
  args: Args;
  obligatoryField?: boolean;
}): JSX.Element {
  const [extraOperations, setExtraOperations] = useState<Operation[]>([]);
  const [fieldType, setFieldType] = useState('select');
  const [operationArgs, setOperationArgs] = useState<Args>({});

  const selectField = (
    <>
      <select
        value={fieldType}
        onChange={(e) => {
          setFieldType(e.target.value);
        }}
      >
        <option value='select' disabled>
          select
        </option>
        <option value='constant'>constant</option>
        <option value='argument'>argument</option>
        <option value='and'>and</option>
        <option value='or'>or</option>
      </select>
      {obligatoryField && (
        <button onClick={() => setFieldType('select')}>X</button>
      )}
    </>
  );
  const constantField = (
    <>
      <select
        onChange={(e) => {
          setOperationArgs({ const: e.target.value === 'true' ? true : false });
        }}
      >
        <option value='true'>true</option>
        <option value='false'>false</option>
      </select>
      {obligatoryField && (
        <button onClick={() => setFieldType('select')}>X</button>
      )}
    </>
  );

  const argumentField = (
    <>
      <select
        onChange={(e) => {
          setOperationArgs({ [e.target.value]: args[e.target.value] });
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
        <button onClick={() => setFieldType('select')}>X</button>
      )}
    </>
  );

  let field: JSX.Element = selectField;

  switch (fieldType) {
    case 'constant':
      field = constantField;
      break;
    case 'argument':
      field = argumentField;
      break;
    case 'and':
    case 'or':
      field = (
        <>
          {selectField}
          <div className='ml-4'>
            <OperationBuilder
              operation={fieldType}
              args={args}
              obligatoryField
              onChange={setOperationArgs}
            />
            <OperationBuilder
              operation={fieldType}
              args={args}
              obligatoryField
              onChange={setOperationArgs}
            />
            {extraOperations.map((operation, id, extraOperations) => (
              <div className='flex-row' key={id}>
                <OperationBuilder
                  args={args}
                  operation={fieldType}
                  onChange={setOperationArgs}
                />
                <button
                  onClick={() =>
                    setExtraOperations(() => {
                      extraOperations.splice(id, 1);
                      return extraOperations;
                    })
                  }
                >
                  X
                </button>
              </div>
            ))}
            <button onClick={addField}>+ add op</button>
          </div>
        </>
      );
      break;

    default:
      field = selectField;
      break;
  }

  useEffect(() => {
    console.log(operationArgs);
    console.log(evaluateOperation(operation, operationArgs));

    if (fieldType !== 'set') {
      onChange({ [fieldType]: evaluateOperation(operation, operationArgs) });
    } else {
      onChange(evaluateOperation(operation, operationArgs));
    }
  }, [fieldType, extraOperations, operationArgs, args]);

  function addField() {
    setExtraOperations((prevOperations) => {
      return [...prevOperations, operation];
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

  console.log('result', result);

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
        />
      </div>
      <div>
        result: {typeof result === 'boolean' ? result.toString() : 'undefined'}
      </div>
    </main>
  );
}
