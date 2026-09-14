import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ICONS_DIR = os.path.join(os.getcwd(), 'public', 'icons')

def create_badge(size, bg_color, border_color=(249, 115, 22, 255), border_width=3):
    badge = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    # Circle badge
    draw.ellipse([border_width, border_width, size - border_width, size - border_width], fill=bg_color, outline=border_color, width=border_width)
    return badge

def generate_custom_3d_icons():
    # 1. Fly Together (Dual synchronized 3D planes)
    flight_im = Image.open(os.path.join(ICONS_DIR, 'flight.png')).convert('RGBA')
    canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    # Plane 1 slightly scaled down in background
    p1 = flight_im.resize((150, 146), Image.Resampling.LANCZOS)
    # Plane 2 slightly larger in foreground
    p2 = flight_im.resize((165, 160), Image.Resampling.LANCZOS)
    canvas.paste(p1, (55, 10), p1)
    canvas.paste(p2, (15, 55), p2)
    canvas.save(os.path.join(ICONS_DIR, 'fly_together.png'))
    print("Created fly_together.png")

    # 2. Live Tracker (Flight with glowing radar pulse rings)
    tracker_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(tracker_canvas)
    # Draw radar concentric circles with soft cyan/sky glow
    center = (115, 112)
    for r in [100, 75, 50, 25]:
        t_draw.ellipse([center[0]-r, center[1]-r, center[0]+r, center[1]+r], outline=(56, 189, 248, 120), width=3)
    # Radar sweep line
    t_draw.line([center[0], center[1], center[0]+95, center[1]-40], fill=(249, 115, 22, 200), width=4)
    # Center plane
    f_center = flight_im.resize((160, 155), Image.Resampling.LANCZOS)
    tracker_canvas.paste(f_center, (35, 35), f_center)
    # Blip badge
    blip = create_badge(36, (249, 115, 22, 255), (255, 255, 255, 255), 3)
    tracker_canvas.paste(blip, (165, 35), blip)
    tracker_canvas.save(os.path.join(ICONS_DIR, 'live_tracker.png'))
    print("Created live_tracker.png")

    # 3. Low Fare (Ticket / Booking with downward discount price drop badge)
    booking_im = Image.open(os.path.join(ICONS_DIR, 'booking.png')).convert('RGBA')
    lowfare_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    b_resized = booking_im.resize((190, 185), Image.Resampling.LANCZOS)
    lowfare_canvas.paste(b_resized, (20, 20), b_resized)
    # Downward trending green/orange discount pill
    draw_lf = ImageDraw.Draw(lowfare_canvas)
    draw_lf.rounded_rectangle([130, 25, 220, 75], radius=15, fill=(16, 185, 129, 255), outline=(255, 255, 255, 255), width=3)
    draw_lf.line([150, 42, 175, 58], fill=(255, 255, 255, 255), width=4)
    draw_lf.line([175, 58, 200, 38], fill=(255, 255, 255, 255), width=4)
    draw_lf.polygon([(202, 38), (192, 35), (200, 48)], fill=(255, 255, 255, 255))
    lowfare_canvas.save(os.path.join(ICONS_DIR, 'low_fare.png'))
    print("Created low_fare.png")

    # 4. Group Polls (Bargaining / Ballot gavel + checkmark vote badge)
    bargaining_im = Image.open(os.path.join(ICONS_DIR, 'bargaining.png')).convert('RGBA')
    polls_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    bg_resized = bargaining_im.resize((190, 185), Image.Resampling.LANCZOS)
    polls_canvas.paste(bg_resized, (15, 20), bg_resized)
    # Vote Ballot badge
    draw_polls = ImageDraw.Draw(polls_canvas)
    draw_polls.rounded_rectangle([140, 20, 218, 90], radius=14, fill=(14, 116, 144, 255), outline=(249, 115, 22, 255), width=3)
    # Draw thumbs up / checkmark
    draw_polls.line([155, 55, 170, 72], fill=(255, 255, 255, 255), width=4)
    draw_polls.line([170, 72, 205, 38], fill=(255, 255, 255, 255), width=5)
    polls_canvas.save(os.path.join(ICONS_DIR, 'group_polls.png'))
    print("Created group_polls.png")

    # 5. Split Cost (Wallet + Division Split indicator)
    wallet_im = Image.open(os.path.join(ICONS_DIR, 'routripo_wallet.png')).convert('RGBA')
    split_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    w_resized = wallet_im.resize((185, 180), Image.Resampling.LANCZOS)
    split_canvas.paste(w_resized, (15, 25), w_resized)
    # Division badge
    draw_split = ImageDraw.Draw(split_canvas)
    draw_split.ellipse([140, 15, 215, 90], fill=(234, 88, 12, 255), outline=(255, 255, 255, 255), width=3)
    # Division symbol ÷
    draw_split.ellipse([173, 28, 183, 38], fill=(255, 255, 255, 255))
    draw_split.line([155, 52, 200, 52], fill=(255, 255, 255, 255), width=5)
    draw_split.ellipse([173, 66, 183, 76], fill=(255, 255, 255, 255))
    split_canvas.save(os.path.join(ICONS_DIR, 'split_cost.png'))
    print("Created split_cost.png")

    # 6. Hotel Vouchers (Hotel + Voucher slip ticket)
    hotel_im = Image.open(os.path.join(ICONS_DIR, 'hotel.png')).convert('RGBA')
    hv_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    h_resized = hotel_im.resize((185, 180), Image.Resampling.LANCZOS)
    hv_canvas.paste(h_resized, (15, 25), h_resized)
    # Voucher golden badge
    draw_hv = ImageDraw.Draw(hv_canvas)
    draw_hv.rounded_rectangle([135, 20, 222, 85], radius=12, fill=(245, 158, 11, 255), outline=(255, 255, 255, 255), width=3)
    draw_hv.line([150, 40, 207, 40], fill=(255, 255, 255, 255), width=3)
    draw_hv.line([150, 52, 195, 52], fill=(255, 255, 255, 255), width=3)
    draw_hv.line([150, 64, 180, 64], fill=(255, 255, 255, 255), width=3)
    hv_canvas.save(os.path.join(ICONS_DIR, 'hotel_vouchers.png'))
    print("Created hotel_vouchers.png")

    # 7. Travel Insurance (Shield + Medical Cross & Protection)
    secret_im = Image.open(os.path.join(ICONS_DIR, 'secret.png')).convert('RGBA')
    ins_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    s_resized = secret_im.resize((185, 180), Image.Resampling.LANCZOS)
    ins_canvas.paste(s_resized, (20, 25), s_resized)
    # Medical Cross Shield badge
    draw_ins = ImageDraw.Draw(ins_canvas)
    draw_ins.ellipse([140, 15, 215, 90], fill=(14, 165, 233, 255), outline=(255, 255, 255, 255), width=3)
    # Red/White health cross
    draw_ins.rectangle([172, 30, 183, 75], fill=(255, 255, 255, 255))
    draw_ins.rectangle([150, 47, 205, 58], fill=(255, 255, 255, 255))
    ins_canvas.save(os.path.join(ICONS_DIR, 'travel_insurance.png'))
    print("Created travel_insurance.png")

    # 8. Expense Analytics (Pie chart & Ledger)
    exp_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    ledger_im = Image.open(os.path.join(ICONS_DIR, 'trip_expenses.png')).convert('RGBA')
    l_resized = ledger_im.resize((185, 180), Image.Resampling.LANCZOS)
    exp_canvas.paste(l_resized, (15, 25), l_resized)
    # Pie chart badge
    draw_exp = ImageDraw.Draw(exp_canvas)
    draw_exp.ellipse([140, 15, 215, 90], fill=(236, 72, 153, 255), outline=(255, 255, 255, 255), width=3)
    # Pie slices
    draw_exp.pieslice([148, 23, 207, 82], 0, 120, fill=(249, 115, 22, 255))
    draw_exp.pieslice([148, 23, 207, 82], 120, 270, fill=(255, 255, 255, 255))
    draw_exp.pieslice([148, 23, 207, 82], 270, 360, fill=(56, 189, 248, 255))
    exp_canvas.save(os.path.join(ICONS_DIR, 'expense_analytics.png'))
    print("Created expense_analytics.png")

    # 9. Group Balance (Scales of balance)
    bal_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    bal_canvas.paste(w_resized, (20, 25), w_resized)
    draw_bal = ImageDraw.Draw(bal_canvas)
    # Scales badge
    draw_bal.ellipse([140, 15, 215, 90], fill=(99, 102, 241, 255), outline=(255, 255, 255, 255), width=3)
    # Balance beam
    draw_bal.line([152, 45, 203, 45], fill=(255, 255, 255, 255), width=4)
    draw_bal.line([177, 45, 177, 75], fill=(255, 255, 255, 255), width=4)
    # Left & Right pans
    draw_bal.line([155, 45, 160, 65], fill=(255, 255, 255, 255), width=2)
    draw_bal.line([200, 45, 195, 65], fill=(255, 255, 255, 255), width=2)
    draw_bal.arc([150, 60, 170, 72], 0, 180, fill=(255, 255, 255, 255), width=3)
    draw_bal.arc([185, 60, 205, 72], 0, 180, fill=(255, 255, 255, 255), width=3)
    bal_canvas.save(os.path.join(ICONS_DIR, 'group_balance.png'))
    print("Created group_balance.png")

    # 10. Settlement (Handshake / Checkmark certified)
    offer_im = Image.open(os.path.join(ICONS_DIR, 'make_an_offer.png')).convert('RGBA')
    settle_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    o_resized = offer_im.resize((185, 180), Image.Resampling.LANCZOS)
    settle_canvas.paste(o_resized, (15, 25), o_resized)
    # Green checkmark seal
    draw_settle = ImageDraw.Draw(settle_canvas)
    draw_settle.ellipse([140, 15, 215, 90], fill=(16, 185, 129, 255), outline=(255, 255, 255, 255), width=3)
    # Checkmark
    draw_settle.line([158, 52, 172, 68], fill=(255, 255, 255, 255), width=5)
    draw_settle.line([172, 68, 200, 36], fill=(255, 255, 255, 255), width=5)
    settle_canvas.save(os.path.join(ICONS_DIR, 'settlement.png'))
    print("Created settlement.png")

if __name__ == '__main__':
    generate_custom_3d_icons()
