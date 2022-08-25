import { SearchResponseHit, Level } from '@orchard/hooks/useLevels';
import { usePreference } from '@orchard/store';
import { useRef, useMemo, useCallback } from 'preact/hooks';
import { useMeasure } from 'react-use';
import { useVirtual } from 'react-virtual';
import { LevelBox } from '@orchard/components/LevelBox';
import { useForkRef } from '@orchard/hooks/useForkRef';
import './LevelsList.css';

import cc from 'clsx';
import { WithClass } from '@orchard/utils/types';

type LevelsListProps = {
    hits: SearchResponseHit<Level>[];
} & WithClass;

export function LevelsList({hits, 'class': _class}: LevelsListProps) {

    const parentRef = useRef<HTMLDivElement>(null);
    const [ref, {width}] = useMeasure<HTMLDivElement>();

    // @ts-ignore this is bc of type differences between React and Preact refs, but it works in practice
    const whatIsEvenHappeningNowRef = useForkRef<HTMLDivElement>(parentRef, ref);

    const [rowView] = usePreference('row view');

    // now we have the width, we can calculate how many columns to put in...
    const columns = useMemo(() => {
        if (rowView) {
            return 1;
        }
        if (width === 0) {
            return 1;
        }
        // blaze it
        return Math.max(Math.ceil(width / 420), 1);
    }, [width, rowView]);

    const estimateSize = useCallback(() => {
        return rowView ? 192 : 395;
    }, [hits, rowView]); // recompute the list if hits changes

    const {
        virtualItems,
        totalSize
    } = useVirtual({
        size: Math.ceil(hits.length / columns),
        parentRef,
        estimateSize
    });
    return (
        <div
            class={cc(_class, 'll')}
            ref={whatIsEvenHappeningNowRef}
            style={{
                height: '100%',
                overflow: 'auto'
            }}
        >
            <div
                class="ll_list"
                style={{
                    height: totalSize,
                    position: 'relative'
                }}
            >
                {
                    virtualItems.map(virtualRow => (
                        <div
                            key={virtualRow.index}
                            ref={virtualRow.measureRef}
                            class="ll_row"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            {
                                hits.slice(
                                    virtualRow.index * columns,
                                    virtualRow.index * columns + columns
                                ).map(hit => (
                                    <LevelBox level={hit.document} class="ll_levelbox" />
                                ))
                            }
                        </div>
                    ))

                }
            </div>
        </div>
    );
}
