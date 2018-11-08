# Here go your api methods.
import time


def get_memos():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    memos = []
    has_more = False
    rows = db().select(db.checklist.ALL, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                title = r.title,
                memo = r.memo,
                user_email = r.user_email,
                updated_on = r.updated_on,
                is_public = r.is_public,
                is_editing = r.is_editing
            )
            memos.append(t)
        else:
            has_more = True
    logged_in = auth.user is not None
    return response.json(dict(
        memos=memos,
        logged_in=logged_in,
        has_more=has_more
    ))



@auth.requires_signature()
def add_memo():
    t_id = db.checklist.insert(
        title = request.vars.title,
        memo = request.vars.memo
    )
    t = db.checklist(t_id)
    return response.json(dict(memo=t))



def del_memo():
    db(db.checklist.id == request.vars.memo_id).delete()
    time.sleep(1)
    return "ok"


def toggle_public():
    track_id = int(request.vars.memo_id)
    t = db.checklist[track_id]
    t.update_record(is_public= not t.is_public)
    return "ok"
    # q = db(db.checklist.id == request.vars.memo_id).select().first()
    # q.update_record(
    #     is_public = not q.is_public
    # )
    # return response.json(dict(memo = q))


def edit_memo():
    q = db(db.checklist.id == request.vars.memo_id).select().first()
    q.update_record(
        title = request.vars.title,
        memo = request.vars.memo
    )